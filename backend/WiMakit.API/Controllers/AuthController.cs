using Google.Apis.Auth;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using WiMakit.API.Data;
using WiMakit.API.DTOs;
using WiMakit.API.Models;
using WiMakit.API.Services;

namespace WiMakit.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            AppDbContext context,
            IConfiguration configuration,
            IEmailService emailService,
            ILogger<AuthController> logger)
        {
            _context = context;
            _configuration = configuration;
            _emailService = emailService;
            _logger = logger;
        }

        // ── Register ──────────────────────────────────────────────────────────
        [HttpPost("register")]
        [EnableRateLimiting("auth-register")]
        public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
        {
            var normalizedEmail = request.Email.Trim().ToLowerInvariant();
            var role = request.Role.Trim().ToLowerInvariant();

            if (role is not ("farmer" or "buyer"))
                return BadRequest(new { message = "Role must be 'farmer' or 'buyer'." });

            if (await _context.Users.AnyAsync(u => u.Email == normalizedEmail))
                return BadRequest(new { message = "Email is already registered" });

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
            var verificationToken = GenerateOtp();

            var user = new User
            {
                FirstName = request.FirstName.Trim(),
                LastName = request.LastName.Trim(),
                Email = normalizedEmail,
                PasswordHash = passwordHash,
                Role = role,
                Phone = request.Phone,
                Location = request.Location,
                FarmSize = request.FarmSize,
                FarmingExperience = request.FarmingExperience,
                BusinessName = request.BusinessName,
                BusinessType = request.BusinessType,
                IsEmailVerified = false,
                EmailVerificationToken = verificationToken,
                EmailVerificationExpiry = DateTime.UtcNow.AddMinutes(15)
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var emailSent = await _emailService.SendVerificationEmailAsync(user.Email, verificationToken);
            if (!emailSent)
            {
                _logger.LogWarning("Verification email could not be sent to {Email}", user.Email);
            }

            return Ok(new
{
    success = true,
    requiresVerification = true,
    email = user.Email,
    message = emailSent
        ? "Registration successful. A verification code has been sent to your email."
        : "Registration successful, but we couldn't send the verification code. Please request a new OTP."
});
        }

        // ── Login ─────────────────────────────────────────────────────────────
        [HttpPost("login")]
        [EnableRateLimiting("auth-login")]
        public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
        {
            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Email == request.Email.Trim().ToLowerInvariant());

            if (user == null || user.PasswordHash == null)
                return Unauthorized(new { message = "Invalid email or password" });

            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                return Unauthorized(new { message = "Invalid email or password" });

            if (!user.IsEmailVerified)
                return Unauthorized(new { message = "Please verify your email before logging in" });

            return Ok(new AuthResponse { Token = GenerateJwtToken(user), User = MapUserToDTO(user) });
        }

        // ── Google OAuth ──────────────────────────────────────────────────────
        [HttpPost("google")]
        [EnableRateLimiting("auth-login")]
        public async Task<ActionResult<AuthResponse>> GoogleAuth(GoogleAuthRequest request)
        {
            var googleClientId = _configuration["Google:ClientId"];
            if (string.IsNullOrWhiteSpace(googleClientId))
                return StatusCode(503, new { message = "Google sign-in is not configured." });

            GoogleJsonWebSignature.Payload payload;

            try
            {
                var settings = new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new[] { googleClientId }
                };
                payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken, settings);
            }
            catch (InvalidJwtException ex)
            {
                _logger.LogWarning("Invalid Google ID token: {Message}", ex.Message);
                return Unauthorized(new { message = "Invalid Google token. Please try again." });
            }

            var email = payload.Email.Trim().ToLowerInvariant();
            var googleId = payload.Subject;

            var user = await _context.Users.FirstOrDefaultAsync(u => u.GoogleId == googleId)
                    ?? await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
            {
                var role = request.Role?.Trim().ToLowerInvariant();
                if (role is not ("farmer" or "buyer"))
                {
                    return BadRequest(new
                    {
                        message = "Please select a role (farmer or buyer) to continue with Google.",
                        code = "ROLE_REQUIRED"
                    });
                }

                user = new User
                {
                    FirstName = (payload.GivenName ?? email.Split('@')[0]).Trim(),
                    LastName = (payload.FamilyName ?? "").Trim(),
                    Email = email,
                    GoogleId = googleId,
                    PasswordHash = null,
                    Role = role,
                    Phone = request.Phone,
                    Location = request.Location,
                    IsEmailVerified = true,
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();
            }
            else
            {
                if (user.GoogleId == null)
                {
                    user.GoogleId = googleId;
                    user.IsEmailVerified = true;
                    user.UpdatedAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }
            }

            return Ok(new AuthResponse { Token = GenerateJwtToken(user), User = MapUserToDTO(user) });
        }

        // ── Verify OTP (Email + 6-digit Code) ─────────────────────────────────
        [HttpPost("verify-otp")]
        [EnableRateLimiting("auth-login")]
        public async Task<ActionResult<AuthResponse>> VerifyOtp(VerifyOtpRequest request)
        {
            var normalizedEmail = request.Email.Trim().ToLowerInvariant();

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == normalizedEmail);

            if (user == null)
                return BadRequest(new { message = "Account not found for this email address." });

            if (user.IsEmailVerified)
            {
                return Ok(new AuthResponse
                {
                    Token = GenerateJwtToken(user),
                    User = MapUserToDTO(user),
                    Message = "Account is already verified. You can log in."
                });
            }

            if (user.EmailVerificationToken != request.Otp)
                return BadRequest(new { message = "Invalid OTP code. Please check your email and try again." });

            if (user.EmailVerificationExpiry < DateTime.UtcNow)
                return BadRequest(new { message = "OTP code has expired. Please click 'Resend Code'." });

            user.IsEmailVerified = true;
            user.EmailVerificationToken = null;
            user.EmailVerificationExpiry = null;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new AuthResponse
            {
                Token = GenerateJwtToken(user),
                User = MapUserToDTO(user),
                Message = "Email verified successfully! You can now log in."
            });
        }

        // ── Resend OTP ────────────────────────────────────────────────────────
        [HttpPost("request-otp")]
        [EnableRateLimiting("auth-register")]
        public async Task<IActionResult> ResendOtp(ResendOtpRequest request)
        {
            var normalizedEmail = request.Email.Trim().ToLowerInvariant();

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == normalizedEmail);

            if (user == null)
                return BadRequest(new { message = "No account found with this email address." });

            if (user.IsEmailVerified)
                return BadRequest(new { message = "Email is already verified. You can log in." });

            var newOtp = GenerateOtp();
            user.EmailVerificationToken = newOtp;
            user.EmailVerificationExpiry = DateTime.UtcNow.AddMinutes(15);
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var emailSent = await _emailService.SendVerificationEmailAsync(user.Email, newOtp);
            if (!emailSent)
            {
                return StatusCode(503, new { message = "Could not send verification email. Please try again shortly." });
            }

            return Ok(new { message = "A new 6-digit OTP code has been sent to your email." });
        }

        // ── Helpers ───────────────────────────────────────────────────────────
        private static string GenerateOtp()
        {
            return RandomNumberGenerator.GetInt32(100000, 1000000).ToString();
        }

        private string GenerateJwtToken(User user)
        {
            var jwtKey = _configuration["Jwt:Key"]
                ?? throw new InvalidOperationException("JWT Key is not configured");

            var claims = new List<Claim>
            {
                new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new(JwtRegisteredClaimNames.Email, user.Email),
                new(JwtRegisteredClaimNames.GivenName, user.FirstName),
                new(JwtRegisteredClaimNames.FamilyName, user.LastName),
                new("role", user.Role),
                new("email_verified", user.IsEmailVerified ? "true" : "false"),
                new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private static UserDTO MapUserToDTO(User user) => new()
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            Role = user.Role,
            Phone = user.Phone,
            Location = user.Location,
            FarmSize = user.FarmSize,
            FarmingExperience = user.FarmingExperience,
            BusinessName = user.BusinessName,
            BusinessType = user.BusinessType,
            IsEmailVerified = user.IsEmailVerified,
            HasGoogleAuth = user.GoogleId != null
        };
    }
}
