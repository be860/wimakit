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

        [HttpPost("process")]
        public async Task<IActionResult> ProcessPayment(PaymentRequest request)
        {
            var userId = GetCurrentUserId();
            request.BuyerId = userId;

            var result = await _paymentService.ProcessPaymentAsync(request);

            if (result.Success)
            {
                return Ok(new { success = true, message = result.Message, orderNumber = result.OrderNumber });
            }

            return BadRequest(new { success = false, message = result.Message });
        }

        [HttpGet("buyer/history")]
        public async Task<ActionResult<IEnumerable<OrderDTO>>> GetBuyerHistory()
        {
            var userId = GetCurrentUserId();
            var history = await _paymentService.GetBuyerOrdersAsync(userId);
            return Ok(history);
        }

        [HttpGet("farmer/sales")]
        public async Task<ActionResult<IEnumerable<OrderDTO>>> GetFarmerSales()
        {
            var userId = GetCurrentUserId();
            var sales = await _paymentService.GetFarmerSalesAsync(userId);
            return Ok(sales);
        }

        [HttpPut("orders/{id:int}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusRequest request)
        {
            var userId = GetCurrentUserId();
            var success = await _paymentService.UpdateOrderStatusAsync(id, userId, request.Status);
            if (!success) return NotFound(new { message = "Order not found or unauthorized." });
            return Ok(new { message = $"Order status updated to {request.Status} successfully." });
        }

        private int GetCurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (int.TryParse(claim, out int id)) return id;
            throw new UnauthorizedAccessException("User ID missing from token.");
        }
    }
}
