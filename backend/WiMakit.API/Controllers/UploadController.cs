using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WiMakit.API.Extensions;
using WiMakit.API.Services;

namespace WiMakit.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UploadController : ControllerBase
    {
        private readonly IFileStorageService _fileStorageService;

        public UploadController(IFileStorageService fileStorageService)
        {
            _fileStorageService = fileStorageService;
        }

        // Both farmers (uploading their own produce photos) and admins (adding/editing
        // listings on a farmer's behalf) can use this endpoint. We only require verified
        // email for farmers — admins are already vetted through their own onboarding.
        [Authorize(Policy = "RequireFarmerOrAdmin")]
        [HttpPost]
        public async Task<ActionResult<object>> UploadImage(IFormFile file)
        {
            var isFarmer = User.HasAnyRole("farmer");
            var isAdmin = User.HasAnyRole("admin", "superadmin");
            if (isFarmer && !isAdmin)
            {
                var emailVerified = User.HasClaim(c => c.Type == "email_verified" && c.Value == "true");
                if (!emailVerified)
                {
                    return Forbid();
                }
            }

            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "No file uploaded" });
            }

            // Validate file type
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(extension))
            {
                return BadRequest(new { message = "Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed." });
            }

            // Validate file size (e.g., 5MB)
            if (file.Length > 5 * 1024 * 1024)
            {
                return BadRequest(new { message = "File size exceeds 5MB limit." });
            }

            var imageUrl = await _fileStorageService.UploadImageAsync(file);

            if (imageUrl == null)
            {
                return StatusCode(502, new { message = "Could not upload image right now. Please try again shortly." });
            }

            return Ok(new { imageUrl });
        }
    }
}
