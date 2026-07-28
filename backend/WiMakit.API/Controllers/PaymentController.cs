using WiMakit.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WiMakit.API.Extensions;

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

        [Authorize(Roles = "buyer", Policy = "VerifiedEmail")]
        [HttpPost("process")]
        public async Task<IActionResult> ProcessPayment(PaymentRequest request)
        {
            var userId = User.GetUserId();
            request.BuyerId = userId;

            var result = await _paymentService.ProcessPaymentAsync(request);

            if (result.Success)
            {
                return Ok(new { success = true, message = result.Message });
            }

            return BadRequest(new { success = false, message = result.Message });
        }

        [Authorize(Roles = "buyer")]
        [HttpGet("buyer/history")]
        public async Task<ActionResult<IEnumerable<OrderDTO>>> GetBuyerHistory()
        {
            var userId = User.GetUserId();
            var history = await _paymentService.GetBuyerOrdersAsync(userId);
            return Ok(history);
        }

        [Authorize(Roles = "farmer")]
        [HttpGet("farmer/sales")]
        public async Task<ActionResult<IEnumerable<OrderDTO>>> GetFarmerSales()
        {
            var userId = User.GetUserId();
            var sales = await _paymentService.GetFarmerSalesAsync(userId);
            return Ok(sales);
        }
    }
}
