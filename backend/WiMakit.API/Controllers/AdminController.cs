using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WiMakit.API.DTOs;
using WiMakit.API.Services;

namespace WiMakit.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = "RequireAdmin")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        [HttpGet("stats")]
        [HttpGet("metrics")]
        public async Task<IActionResult> GetAdminMetrics()
        {
            var stats = await _adminService.GetAdminMetricsAsync();
            return Ok(stats);
        }

        [HttpGet("farmers")]
        public async Task<IActionResult> GetFarmers([FromQuery] string? status, [FromQuery] string? search, [FromQuery] string? district)
        {
            var farmers = await _adminService.GetFarmersAsync(status, search, district);
            return Ok(farmers);
        }

        [HttpGet("farmers/{id:int}")]
        public async Task<IActionResult> GetFarmerById(int id)
        {
            var farmer = await _adminService.GetFarmerByIdAsync(id);
            if (farmer == null) return NotFound(new { message = "Farmer not found." });
            return Ok(farmer);
        }

        [HttpPut("farmers/{id:int}/status")]
        public async Task<IActionResult> UpdateFarmerStatus(int id, [FromBody] UpdateFarmerStatusRequest request)
        {
            var adminId = GetCurrentUserId();
            var adminName = GetCurrentUserName();

            var success = await _adminService.UpdateFarmerStatusAsync(id, request.Status, request.Note, adminId, adminName);
            if (!success) return NotFound(new { message = "Farmer not found." });
            return Ok(new { message = $"Farmer status updated to {request.Status} successfully." });
        }

        [HttpGet("buyers")]
        public async Task<IActionResult> GetBuyers([FromQuery] string? status, [FromQuery] string? search)
        {
            var buyers = await _adminService.GetBuyersAsync(status, search);
            return Ok(buyers);
        }

        [HttpPut("buyers/{id:int}/status")]
        public async Task<IActionResult> UpdateBuyerStatus(int id, [FromBody] UpdateBuyerStatusRequest request)
        {
            var adminId = GetCurrentUserId();
            var adminName = GetCurrentUserName();

            var success = await _adminService.UpdateBuyerStatusAsync(id, request.Status, adminId, adminName);
            if (!success) return NotFound(new { message = "Buyer not found." });
            return Ok(new { message = $"Buyer status updated to {request.Status} successfully." });
        }

        [HttpGet("products")]
        public async Task<IActionResult> GetProducts([FromQuery] string? status, [FromQuery] string? search)
        {
            var products = await _adminService.GetProductsAsync(status, search);
            return Ok(products);
        }

        [HttpPut("products/{id:int}/status")]
        public async Task<IActionResult> UpdateProductStatus(int id, [FromBody] UpdateProductStatusRequest request)
        {
            var adminId = GetCurrentUserId();
            var adminName = GetCurrentUserName();

            var success = await _adminService.UpdateProductStatusAsync(id, request.Status, request.Note, adminId, adminName);
            if (!success) return NotFound(new { message = "Product not found." });
            return Ok(new { message = $"Product status updated to {request.Status} successfully." });
        }

        [HttpGet("fraud-cases")]
        public async Task<IActionResult> GetFraudCases([FromQuery] string? status)
        {
            var cases = await _adminService.GetFraudCasesAsync(status);
            return Ok(cases);
        }

        [HttpGet("fraud-cases/{id:int}")]
        public async Task<IActionResult> GetFraudCaseById(int id)
        {
            var fc = await _adminService.GetFraudCaseByIdAsync(id);
            if (fc == null) return NotFound(new { message = "Fraud case not found." });
            return Ok(fc);
        }

        [HttpPut("fraud-cases/{id:int}/status")]
        public async Task<IActionResult> UpdateFraudCaseStatus(int id, [FromBody] UpdateFraudCaseRequest request)
        {
            var adminId = GetCurrentUserId();
            var adminName = GetCurrentUserName();

            var success = await _adminService.UpdateFraudCaseStatusAsync(id, request.Status, request.AssignedTo, adminId, adminName);
            if (!success) return NotFound(new { message = "Fraud case not found." });
            return Ok(new { message = $"Fraud case updated to {request.Status} successfully." });
        }

        [HttpGet("audit-log")]
        [HttpGet("audit-logs")]
        [Authorize(Policy = "RequireSuperAdmin")] // Audit log is SuperAdmin-only
        public async Task<IActionResult> GetAuditLogs()
        {
            var logs = await _adminService.GetAuditLogsAsync();
            return Ok(logs);
        }

        [HttpPost("notifications/broadcast")]
        public async Task<IActionResult> BroadcastNotification([FromBody] BroadcastNotificationRequest request)
        {
            var adminId = GetCurrentUserId();
            var adminName = GetCurrentUserName();

            var success = await _adminService.BroadcastNotificationAsync(request, adminId, adminName);
            return Ok(new { message = "Broadcast notification sent successfully." });
        }

        [HttpPost("/api/superadmin/create-admin")]
        [Authorize(Policy = "RequireSuperAdmin")]
        public async Task<IActionResult> CreateAdmin([FromBody] CreateAdminRequest request)
        {
            var adminId = GetCurrentUserId();
            var adminName = GetCurrentUserName();

            var (success, message, user) = await _adminService.CreateAdminAsync(request, adminId, adminName);
            if (!success) return BadRequest(new { message });

            return Ok(new { success = true, message, user });
        }

        private int GetCurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            return int.TryParse(claim, out int id) ? id : 1;
        }

        private string GetCurrentUserName()
        {
            return User.FindFirst(ClaimTypes.Name)?.Value ?? "SuperAdmin";
        }
    }
}
