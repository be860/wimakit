using WiMakit.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace WiMakit.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;

        public PaymentController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        [Authorize(Roles = "buyer")]
        [HttpPost("process")]
        public async Task<IActionResult> ProcessPayment(PaymentRequest request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            request.BuyerId = userId;

            var result = await _paymentService.ProcessPaymentAsync(request);

            if (result)
            {
                return Ok(new { success = true, message = "Payment successful" });
            }

            return BadRequest(new { success = false, message = "Payment failed" });
        }

        [Authorize(Roles = "buyer")]
        [HttpGet("buyer/history")]
        public async Task<ActionResult<IEnumerable<OrderDTO>>> GetBuyerHistory()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var history = await _paymentService.GetBuyerOrdersAsync(userId);
            return Ok(history);
        }

        [Authorize]
        [HttpGet("farmer/sales")]
        public async Task<ActionResult<IEnumerable<OrderDTO>>> GetFarmerSales()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var sales = await _paymentService.GetFarmerSalesAsync(userId);
            return Ok(sales);
        }
    }
}
