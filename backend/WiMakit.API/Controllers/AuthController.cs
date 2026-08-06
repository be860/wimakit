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
        private readonly IFileStorageService _fileStorage;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            AppDbContext context,
            IConfiguration configuration,
            IEmailService emailService,
            IFileStorageService fileStorage,
            ILogger<AuthController> logger)
        {
            _context = context;
            _configuration = configuration;
            _emailService = emailService;
            _fileStorage = fileStorage;
            _logger = logger;
        }

        // ── Register ──────────────────────────────────────────────────────────
        [HttpPost("register")]
        [EnableRateLimiting("auth-register")]
        public async Task<ActionResult<AuthResponse>> Register([FromForm] RegisterRequest request)
        {
            var normalizedEmail = request.Email.Trim().ToLowerInvariant();
            var role = request.Role.Trim().ToLowerInvariant();

            if (role is not ("farmer" or "buyer"))
                return BadRequest(new { message = "Role must be 'farmer' or 'buyer'." });

            if (await _context.Users.AnyAsync(u => u.Email == normalizedEmail))
                return BadRequest(new { message = "Email is already registered" });

            // ── Farmer ID verification ─────────────────────────────────────
            string? idDocFrontUrl = null;
            string? idDocBackUrl = null;

            if (role == "farmer")
            {
                if (string.IsNullOrWhiteSpace(request.NIN))
                    return BadRequest(new { message = "NIN (National Identification Number) is required for farmer registration." });

                var docType = request.IdDocumentType?.Trim();
                if (string.IsNullOrWhiteSpace(docType) || docType is not ("National ID" or "Voter Card"))
                    return BadRequest(new { message = "Please select a valid document type (National ID or Voter Card)." });

                if (docType is "National ID" or "Voter Card")
                {
                    if (request.IdDocumentFront == null || request.IdDocumentFront.Length == 0)
                        return BadRequest(new { message = $"{docType} front image is required." });
                    if (request.IdDocumentBack == null || request.IdDocumentBack.Length == 0)
                        return BadRequest(new { message = $"{docType} back image is required." });

                    var allowedExts = new[] { ".jpg", ".jpeg", ".png", ".webp" };
                    const long maxSize = 5 * 1024 * 1024; // 5 MB

                    var frontExt = Path.GetExtension(request.IdDocumentFront.FileName).ToLowerInvariant();
                    var backExt = Path.GetExtension(request.IdDocumentBack.FileName).ToLowerInvariant();

                    if (!allowedExts.Contains(frontExt) || !allowedExts.Contains(backExt))
                        return BadRequest(new { message = "ID document images must be JPG, PNG, or WebP." });

                    if (request.IdDocumentFront.Length > maxSize || request.IdDocumentBack.Length > maxSize)
                        return BadRequest(new { message = "Each ID image must be under 5 MB." });

                    var idBucket = _configuration["Supabase:IdDocumentsBucket"] ?? "id-documents";
                    idDocFrontUrl = await _fileStorage.UploadImageAsync(request.IdDocumentFront, idBucket);
                    idDocBackUrl = await _fileStorage.UploadImageAsync(request.IdDocumentBack, idBucket);

                    if (idDocFrontUrl == null || idDocBackUrl == null)
                        return StatusCode(503, new { message = "Could not upload ID images. Please check storage bucket configuration." });
                }
            }

            // ── Farmer profile & farm photos ─────────────────────────────────
            string? profilePhotoUrl = null;
            string? farmPhotoUrl = null;

            if (role == "farmer")
            {
                if (request.ProfilePhoto == null || request.ProfilePhoto.Length == 0)
                    return BadRequest(new { message = "A profile photo is required for farmer registration." });

                if (request.FarmPhoto == null || request.FarmPhoto.Length == 0)
                    return BadRequest(new { message = "A photo of your farm is required for farmer registration." });

                var allowedExts = new[] { ".jpg", ".jpeg", ".png", ".webp" };
                const long maxSize = 5 * 1024 * 1024; // 5 MB

                var profileExt = Path.GetExtension(request.ProfilePhoto.FileName).ToLowerInvariant();
                var farmExt = Path.GetExtension(request.FarmPhoto.FileName).ToLowerInvariant();

                if (!allowedExts.Contains(profileExt) || !allowedExts.Contains(farmExt))
                    return BadRequest(new { message = "Profile and farm photos must be JPG, PNG, or WebP." });

                if (request.ProfilePhoto.Length > maxSize || request.FarmPhoto.Length > maxSize)
                    return BadRequest(new { message = "Each photo must be under 5 MB." });

                var profileBucket = _configuration["Supabase:ProfilePhotosBucket"] ?? "profile-photos";
                var farmBucket = _configuration["Supabase:FarmPhotosBucket"] ?? "farm-photos";

                profilePhotoUrl = await _fileStorage.UploadImageAsync(request.ProfilePhoto, profileBucket);
                farmPhotoUrl = await _fileStorage.UploadImageAsync(request.FarmPhoto, farmBucket);

                if (profilePhotoUrl == null || farmPhotoUrl == null)
                    return StatusCode(503, new { message = "Could not upload your photos. Please check storage bucket configuration." });
            }

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
                District = request.Location,
                NIN = request.NIN?.Trim(),
                IdDocumentType = request.IdDocumentType?.Trim(),
                IdDocumentFrontUrl = idDocFrontUrl,
                IdDocumentBackUrl = idDocBackUrl,
                ProfilePhotoUrl = profilePhotoUrl,
                FarmPhotoUrl = farmPhotoUrl,
                FarmSize = request.FarmSize,
                FarmingExperience = request.FarmingExperience,
                BusinessName = request.BusinessName,
                BusinessType = request.BusinessType,
                VerificationStatus = role == "farmer" ? "Pending" : "Approved",
                Status = "Active",
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
            var normalizedEmail = request.Email.Trim().ToLowerInvariant();
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == normalizedEmail);

            if (user == null || user.PasswordHash == null)
                return Unauthorized(new { message = "Invalid email or password" });

            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                if (user.Role == "SuperAdmin")
                {
                    _context.AuditLogs.Add(new AuditLog
                    {
                        AdminId = user.Id,
                        AdminName = user.FullName,
                        Action = "SuperAdminLoginFailed",
                        TargetType = "User",
                        TargetId = user.Id.ToString(),
                        Details = $"Failed login attempt for SuperAdmin {user.Email}",
                        CreatedAt = DateTime.UtcNow
                    });
                    await _context.SaveChangesAsync();
                }
                return Unauthorized(new { message = "Invalid email or password" });
            }

            if (!user.IsEmailVerified)
                return Unauthorized(new { message = "Please verify your email before logging in" });

            if (user.Role == "SuperAdmin")
            {
                _context.AuditLogs.Add(new AuditLog
                {
                    AdminId = user.Id,
                    AdminName = user.FullName,
                    Action = "SuperAdminLoginSuccess",
                    TargetType = "User",
                    TargetId = user.Id.ToString(),
                    Details = $"Successful SuperAdmin login for {user.Email}",
                    CreatedAt = DateTime.UtcNow
                });
                await _context.SaveChangesAsync();
            }

            var refreshToken = await CreateAndSaveRefreshTokenAsync(user);

            return Ok(new AuthResponse
            {
                AccessToken = GenerateAccessToken(user),
                RefreshToken = refreshToken,
                User = MapUserToDTO(user),
                MustChangePassword = user.MustChangePassword
            });
        }

        // ── Change Password ───────────────────────────────────────────────────
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword(ChangePasswordRequest request)
        {
            var emailClaim = User.FindFirst(JwtRegisteredClaimNames.Email)?.Value;
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == emailClaim || u.Email == request.CurrentPassword);

            if (user == null && !string.IsNullOrEmpty(emailClaim))
                user = await _context.Users.FirstOrDefaultAsync(u => u.Email == emailClaim);

            if (user == null)
                return Unauthorized(new { message = "User account not found." });

            if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
                return BadRequest(new { message = "Current password is incorrect." });

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.MustChangePassword = false;
            user.UpdatedAt = DateTime.UtcNow;

            if (user.Role == "SuperAdmin")
            {
                _context.AuditLogs.Add(new AuditLog
                {
                    AdminId = user.Id,
                    AdminName = user.FullName,
                    Action = "PasswordChanged",
                    TargetType = "User",
                    TargetId = user.Id.ToString(),
                    Details = $"Password updated for SuperAdmin {user.Email}",
                    CreatedAt = DateTime.UtcNow
                });
            }

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Password changed successfully." });
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
                    Role = role ?? "buyer",
                    Phone = request.Phone,
                    Location = request.Location,
                    District = request.Location,
                    VerificationStatus = role == "farmer" ? "Pending" : "Approved",
                    Status = "Active",
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

            var refreshToken = await CreateAndSaveRefreshTokenAsync(user);

return Ok(new AuthResponse
{
    AccessToken = GenerateAccessToken(user),
    RefreshToken = refreshToken,
    User = MapUserToDTO(user)
});
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
                    AccessToken = GenerateAccessToken(user),
                    RefreshToken = string.Empty,
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

            var refreshToken = await CreateAndSaveRefreshTokenAsync(user);

return Ok(new AuthResponse
{
    AccessToken = GenerateAccessToken(user),
    RefreshToken = refreshToken,
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

        [HttpPost("refresh")]
public async Task<IActionResult> Refresh(RefreshTokenRequest request)
{
    var refreshToken = await _context.RefreshTokens
        .Include(rt => rt.User)
        .FirstOrDefaultAsync(rt => rt.Token == request.RefreshToken);

    if (refreshToken == null)
        return Unauthorized(new { message = "Invalid refresh token." });

    if (refreshToken.IsRevoked)
        return Unauthorized(new { message = "Refresh token has been revoked." });

    if (refreshToken.IsExpired)
        return Unauthorized(new { message = "Refresh token has expired." });

    var accessToken = GenerateAccessToken(refreshToken.User);

    refreshToken.RevokedAt = DateTime.UtcNow;

var newRefreshToken = await CreateAndSaveRefreshTokenAsync(refreshToken.User);

var newAccessToken = GenerateAccessToken(refreshToken.User);

return Ok(new AuthResponse
{
    AccessToken = newAccessToken,
    RefreshToken = newRefreshToken,
    User = MapUserToDTO(refreshToken.User)
});
}

[HttpPost("logout")]
public async Task<IActionResult> Logout(RefreshTokenRequest request)
{
    var refreshToken = await _context.RefreshTokens
        .FirstOrDefaultAsync(rt => rt.Token == request.RefreshToken);

    if (refreshToken == null)
        return Ok();

    refreshToken.RevokedAt = DateTime.UtcNow;

    await _context.SaveChangesAsync();

    return Ok(new
    {
        message = "Logged out successfully."
    });
}

        // ── Helpers ───────────────────────────────────────────────────────────
        private static string GenerateOtp()
        {
            return RandomNumberGenerator.GetInt32(100000, 1000000).ToString();
        }
        private static string GenerateRefreshToken()
        
{
    return Convert.ToBase64String(
        RandomNumberGenerator.GetBytes(64));
}

        private async Task<string> CreateAndSaveRefreshTokenAsync(User user)
{
    var token = GenerateRefreshToken();

    var refreshToken = new RefreshToken
    {
        Token = token,
        UserId = user.Id,
        ExpiresAt = DateTime.UtcNow.AddDays(30)
    };

    _context.RefreshTokens.Add(refreshToken);
    await _context.SaveChangesAsync();

    return token;
}
        private string GenerateAccessToken(User user)
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

            var tokenExpiry = user.Role == "SuperAdmin"
                ? DateTime.UtcNow.AddHours(2)
                : DateTime.UtcNow.AddMinutes(15);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: tokenExpiry,
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
            MustChangePassword = user.MustChangePassword,
            HasGoogleAuth = user.GoogleId != null,
            NIN = user.NIN,
            IdDocumentType = user.IdDocumentType,
            IdDocumentFrontUrl = user.IdDocumentFrontUrl,
            IdDocumentBackUrl = user.IdDocumentBackUrl,
            ProfilePhotoUrl = user.ProfilePhotoUrl,
            FarmPhotoUrl = user.FarmPhotoUrl
        };
    }
}
