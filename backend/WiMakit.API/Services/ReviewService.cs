using Microsoft.EntityFrameworkCore;
using WiMakit.API.Data;
using WiMakit.API.DTOs;
using WiMakit.API.Models;

namespace WiMakit.API.Services
{
    public interface IReviewService
    {
        Task<IEnumerable<ReviewDTO>> GetFarmerReviewsAsync(int farmerId);
        Task<ReviewDTO> CreateReviewAsync(int buyerId, CreateReviewRequest request);
        Task<bool> ReplyReviewAsync(int reviewId, int farmerId, string reply);
        Task<IEnumerable<RatingDistributionDTO>> GetRatingDistributionAsync(int farmerId);
    }

    public class ReviewService : IReviewService
    {
        private readonly AppDbContext _context;

        public ReviewService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ReviewDTO>> GetFarmerReviewsAsync(int farmerId)
        {
            var reviews = await _context.Reviews
                .Where(r => r.FarmerId == farmerId)
                .Include(r => r.Produce)
                .Include(r => r.Buyer)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            // Resolve the buyer's CURRENT name/photo from the User table rather than
            // the BuyerName snapshot column — this also self-heals older reviews that
            // were stored with "Buyer User" (see CreateReviewAsync's history: the
            // controller used to read a JWT claim that isn't actually issued, so every
            // review fell back to that placeholder).
            return reviews.Select(r =>
            {
                var displayName = !string.IsNullOrWhiteSpace(r.Buyer?.FullName) ? r.Buyer!.FullName : r.BuyerName;
                return new ReviewDTO
                {
                    Id = r.Id,
                    ProduceId = r.ProduceId,
                    Product = r.Produce != null ? r.Produce.Name : "General Review",
                    FarmerId = r.FarmerId,
                    BuyerId = r.BuyerId,
                    Buyer = displayName,
                    BuyerProfilePhotoUrl = r.Buyer?.ProfilePhotoUrl,
                    Initials = GetInitials(displayName),
                    Rating = r.Rating,
                    Comment = r.Comment,
                    Reply = r.Reply,
                    Date = r.CreatedAt
                };
            });
        }

        public async Task<ReviewDTO> CreateReviewAsync(int buyerId, CreateReviewRequest request)
        {
            // Look the buyer up directly instead of trusting a name passed in from the
            // controller — that used to come from a JWT "name" claim the token never
            // actually issues, so every review silently fell back to "Buyer User".
            var buyer = await _context.Users.FindAsync(buyerId);
            var buyerName = !string.IsNullOrWhiteSpace(buyer?.FullName) ? buyer!.FullName : "Buyer";

            var review = new Review
            {
                ProduceId = request.ProduceId,
                FarmerId = request.FarmerId,
                BuyerId = buyerId,
                BuyerName = buyerName,
                Rating = Math.Clamp(request.Rating, 1, 5),
                Comment = request.Comment,
                CreatedAt = DateTime.UtcNow
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            var produce = request.ProduceId.HasValue ? await _context.Produces.FindAsync(request.ProduceId.Value) : null;

            return new ReviewDTO
            {
                Id = review.Id,
                ProduceId = review.ProduceId,
                Product = produce != null ? produce.Name : "General Review",
                FarmerId = review.FarmerId,
                BuyerId = review.BuyerId,
                Buyer = buyerName,
                BuyerProfilePhotoUrl = buyer?.ProfilePhotoUrl,
                Initials = GetInitials(buyerName),
                Rating = review.Rating,
                Comment = review.Comment,
                Reply = review.Reply,
                Date = review.CreatedAt
            };
        }

        public async Task<bool> ReplyReviewAsync(int reviewId, int farmerId, string reply)
        {
            var review = await _context.Reviews.FirstOrDefaultAsync(r => r.Id == reviewId && r.FarmerId == farmerId);
            if (review == null) return false;

            review.Reply = reply;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<RatingDistributionDTO>> GetRatingDistributionAsync(int farmerId)
        {
            var groups = await _context.Reviews
                .Where(r => r.FarmerId == farmerId)
                .GroupBy(r => r.Rating)
                .Select(g => new { Stars = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.Stars, x => x.Count);

            var result = new List<RatingDistributionDTO>();
            for (int stars = 5; stars >= 1; stars--)
            {
                result.Add(new RatingDistributionDTO
                {
                    Stars = stars,
                    Count = groups.TryGetValue(stars, out var count) ? count : 0
                });
            }
            return result;
        }

        private static string GetInitials(string name)
        {
            if (string.IsNullOrWhiteSpace(name)) return "U";
            var parts = name.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length == 1) return parts[0][..1].ToUpper();
            return $"{parts[0][0]}{parts[1][0]}".ToUpper();
        }
    }
}
