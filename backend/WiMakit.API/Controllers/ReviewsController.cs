using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WiMakit.API.DTOs;
using WiMakit.API.Services;

namespace WiMakit.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewsController : ControllerBase
    {
        private readonly IReviewService _reviewService;

        public ReviewsController(IReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        [HttpGet("farmer/{farmerId:int}")]
        public async Task<IActionResult> GetFarmerReviews(int farmerId)
        {
            var reviews = await _reviewService.GetFarmerReviewsAsync(farmerId);
            return Ok(reviews);
        }

        [HttpGet("farmer/{farmerId:int}/distribution")]
        public async Task<IActionResult> GetRatingDistribution(int farmerId)
        {
            var dist = await _reviewService.GetRatingDistributionAsync(farmerId);
            return Ok(dist);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateReview([FromBody] CreateReviewRequest request)
        {
            var buyerId = GetCurrentUserId();
            var buyerName = GetCurrentUserName();

            var review = await _reviewService.CreateReviewAsync(buyerId, buyerName, request);
            return Ok(review);
        }

        [HttpPost("{id:int}/reply")]
        [Authorize]
        public async Task<IActionResult> ReplyReview(int id, [FromBody] ReplyReviewRequest request)
        {
            var farmerId = GetCurrentUserId();
            var success = await _reviewService.ReplyReviewAsync(id, farmerId, request.Reply);
            if (!success) return NotFound(new { message = "Review not found or unauthorized." });
            return Ok(new { message = "Reply posted successfully." });
        }

        private int GetCurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (int.TryParse(claim, out int id)) return id;
            throw new UnauthorizedAccessException("User ID missing from token.");
        }

        private string GetCurrentUserName()
        {
            return User.FindFirst(ClaimTypes.Name)?.Value ?? "Buyer User";
        }
    }
}
