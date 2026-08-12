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
    public class FraudController : ControllerBase
    {
        private readonly IFraudService _fraudService;

        public FraudController(IFraudService fraudService)
        {
            _fraudService = fraudService;
        }

        /// <summary>Buyer reports a suspected fraud/issue on one of their own orders.</summary>
        [HttpPost("report")]
        public async Task<IActionResult> ReportFraud([FromBody] CreateFraudCaseRequest request)
        {
            var buyerId = GetCurrentUserId();
            var (fraudCase, error) = await _fraudService.ReportFraudAsync(buyerId, request);

            if (fraudCase == null)
            {
                return BadRequest(new { message = error ?? "Could not submit this report." });
            }

            // A duplicate-open-report case still returns 200 with the existing case,
            // but surfaces the informational message so the app can show it.
            if (error != null)
            {
                return Ok(new { fraudCase, message = error });
            }

            return Ok(new { fraudCase, message = "Your report has been submitted. Our team will review it shortly." });
        }

        /// <summary>Buyer's own fraud report history.</summary>
        [HttpGet("my-reports")]
        public async Task<IActionResult> GetMyReports()
        {
            var buyerId = GetCurrentUserId();
            var cases = await _fraudService.GetMyFraudCasesAsync(buyerId);
            return Ok(cases);
        }

        private int GetCurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (int.TryParse(claim, out int id)) return id;
            throw new UnauthorizedAccessException("User ID missing from token.");
        }
    }
}
