using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
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
        
        public AuthController(AppDbContext context, IConfiguration configuration, IEmailService emailService)
        {
            _context = context;
            _configuration = configuration;
            _emailService = emailService;
        }
        
        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
        {
            // Check if email already exists
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return BadRequest(new { message = "Email already registered" });
            }
            
            // Hash password
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
            
            // Generate email verification token (6-digit OTP)
            var verificationToken = new Random().Next(100000, 999999).ToString();
            
            // Create user
            var user = new User
            {
                Name = request.Name,
                Email = request.Email,
                PasswordHash = passwordHash,
                Role = request.Role,
                Phone = request.Phone,
                Location = request.Location,
                FarmSize = request.FarmSize,
                FarmingExperience = request.FarmingExperience,
                BusinessName = request.BusinessName,
                BusinessType = request.BusinessType,
                IsEmailVerified = false,
                EmailVerificationToken = verificationToken,
                EmailVerificationExpiry = DateTime.UtcNow.AddHours(24)
            };
            
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            
            // Send verification email with token
            await _emailService.SendVerificationEmailAsync(user.Email, verificationToken);
            
            var userDto = MapUserToDTO(user);
            var token = GenerateJwtToken(user);
            
            return Ok(new AuthResponse { Token = token, User = userDto });
        }
        
        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
        {
            // Find user by email
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            
            if (user == null)
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }
            
            // Verify password
            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }
            
            // Check if email is verified
            if (!user.IsEmailVerified)
            {
                return Unauthorized(new { message = "Please verify your email before logging in" });
            }
            
            var userDto = MapUserToDTO(user);
            var token = GenerateJwtToken(user);
            
            return Ok(new AuthResponse { Token = token, User = userDto });
        }
        
        [HttpPost("verify-email")]
        public async Task<IActionResult> VerifyEmail(VerifyEmailRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.EmailVerificationToken == request.Token);
            
            if (user == null)
            {
                return BadRequest(new { message = "Invalid verification token" });
            }
            
            if (user.EmailVerificationExpiry < DateTime.UtcNow)
            {
                return BadRequest(new { message = "Verification token has expired" });
            }
            
            user.IsEmailVerified = true;
            user.EmailVerificationToken = null;
            user.EmailVerificationExpiry = null;
            user.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "Email verified successfully" });
        }
        
        private string GenerateJwtToken(User user)
        {
            var jwtKey = _configuration["Jwt:Key"];
            var jwtIssuer = _configuration["Jwt:Issuer"];
            var jwtAudience = _configuration["Jwt:Audience"];
            
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };
            
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            
            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: creds
            );
            
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
        
        private UserDTO MapUserToDTO(User user)
        {
            return new UserDTO
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                Phone = user.Phone,
                Location = user.Location,
                FarmSize = user.FarmSize,
                FarmingExperience = user.FarmingExperience,
                BusinessName = user.BusinessName,
                BusinessType = user.BusinessType,
                IsEmailVerified = user.IsEmailVerified
            };
        }
    }
}
