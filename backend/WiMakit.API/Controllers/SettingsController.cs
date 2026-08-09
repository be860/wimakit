using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WiMakit.API.Data;
using WiMakit.API.DTOs;
using WiMakit.API.Extensions;
using WiMakit.API.Models;
using WiMakit.API.Services;

namespace WiMakit.API.Controllers
{
    [ApiController]
    [Route("api/admin/[controller]")]
    [Authorize(Policy = "RequireAdmin")]
    public class SettingsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IAdminService _adminService;

        public SettingsController(AppDbContext context, IAdminService adminService)
        {
            _context = context;
            _adminService = adminService;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var settings = await GetOrCreateAsync();
            return Ok(MapToDTO(settings));
        }

        [HttpPut]
        [Authorize(Policy = "RequireSuperAdmin")] // Platform-wide policy changes are SuperAdmin-only
        public async Task<IActionResult> Update([FromBody] UpdatePlatformSettingsRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var settings = await GetOrCreateAsync();

            settings.PlatformName = request.PlatformName.Trim();
            settings.SupportEmail = request.SupportEmail.Trim().ToLowerInvariant();
            settings.DisplayCurrency = request.DisplayCurrency;
            settings.BaseCommission = request.BaseCommission;
            settings.PayoutSchedule = request.PayoutSchedule;
            settings.ManualReviewThreshold = request.ManualReviewThreshold;
            settings.RequireNinVerification = request.RequireNinVerification;
            settings.AutoHoldHighValueOrders = request.AutoHoldHighValueOrders;
            settings.RequireTwoFactorForStaff = request.RequireTwoFactorForStaff;
            settings.UpdatedAt = DateTime.UtcNow;
            settings.UpdatedBy = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Email)?.Value
                ?? User.FindFirst("email")?.Value;

            await _context.SaveChangesAsync();

            var adminId = User.GetUserId();
            var adminName = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value ?? settings.UpdatedBy ?? "Admin";
            await _adminService.WriteAuditLogAsync("UPDATE_PLATFORM_SETTINGS", "PlatformSettings", "1",
                "Updated platform-wide settings", adminId, adminName);

            return Ok(MapToDTO(settings));
        }

        private async Task<PlatformSettings> GetOrCreateAsync()
        {
            var settings = await _context.PlatformSettings.FirstOrDefaultAsync(s => s.Id == 1);
            if (settings != null) return settings;

            settings = new PlatformSettings { Id = 1 };
            _context.PlatformSettings.Add(settings);
            await _context.SaveChangesAsync();
            return settings;
        }

        private static PlatformSettingsDTO MapToDTO(PlatformSettings s) => new()
        {
            PlatformName = s.PlatformName,
            SupportEmail = s.SupportEmail,
            DisplayCurrency = s.DisplayCurrency,
            BaseCommission = s.BaseCommission,
            PayoutSchedule = s.PayoutSchedule,
            ManualReviewThreshold = s.ManualReviewThreshold,
            RequireNinVerification = s.RequireNinVerification,
            AutoHoldHighValueOrders = s.AutoHoldHighValueOrders,
            RequireTwoFactorForStaff = s.RequireTwoFactorForStaff,
            UpdatedAt = s.UpdatedAt,
            UpdatedBy = s.UpdatedBy
        };
    }
}
