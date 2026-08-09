using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WiMakit.API.DTOs;
using WiMakit.API.Services;

namespace WiMakit.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IFileStorageService _fileStorageService;
        private readonly IConfiguration _configuration;

        public UserController(IUserService userService, IFileStorageService fileStorageService, IConfiguration configuration)
        {
            _userService = userService;
            _fileStorageService = fileStorageService;
            _configuration = configuration;
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = GetCurrentUserId();
            var profile = await _userService.GetProfileAsync(userId);
            if (profile == null) return NotFound(new { message = "User profile not found." });
            return Ok(profile);
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserProfileRequest request)
        {
            var userId = GetCurrentUserId();
            var updated = await _userService.UpdateProfileAsync(userId, request);
            if (updated == null) return NotFound(new { message = "User profile not found." });
            return Ok(updated);
        }

        /// <summary>Uploads a new avatar/profile photo and sets it as the user's ProfilePhotoUrl.</summary>
        [HttpPost("profile/photo")]
        public async Task<IActionResult> UploadProfilePhoto(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded." });

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(extension))
                return BadRequest(new { message = "Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed." });

            if (file.Length > 5 * 1024 * 1024)
                return BadRequest(new { message = "File size exceeds 5MB limit." });

            var imageUrl = await _fileStorageService.UploadImageAsync(file, "profile-photos");
            if (imageUrl == null)
                return StatusCode(502, new { message = "Could not upload the photo right now. Please try again shortly." });

            var userId = GetCurrentUserId();
            var updated = await _userService.SetProfilePhotoAsync(userId, imageUrl);
            if (updated == null) return NotFound(new { message = "User profile not found." });

            return Ok(updated);
        }

        [HttpPost("profile-photo")]

        [HttpPost("farm-photo")]
        [Authorize(Policy = "RequireFarmer")]
        public async Task<IActionResult> UploadFarmPhoto(IFormFile file)
        {
            var url = await UploadPhotoAsync(file, _configuration["Supabase:FarmPhotosBucket"] ?? "farm-photos");
            if (url == null) return BadRequest(new { message = "Please upload a valid JPG, PNG, or WebP image under 5MB." });

            var userId = GetCurrentUserId();
            var updated = await _userService.UpdateFarmPhotoAsync(userId, url);
            if (updated == null) return NotFound(new { message = "User profile not found." });
            return Ok(updated);
        }

        private async Task<string?> UploadPhotoAsync(IFormFile file, string bucket)
        {
            if (file == null || file.Length == 0) return null;

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(extension)) return null;
            if (file.Length > 5 * 1024 * 1024) return null;

            return await _fileStorageService.UploadImageAsync(file, bucket);
        }

        private int GetCurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (int.TryParse(claim, out int id)) return id;
            throw new UnauthorizedAccessException("User ID missing from token.");
        }
    }
}
