namespace WiMakit.API.DTOs
{
    public class ReviewDTO
    {
        public int Id { get; set; }
        public int? ProduceId { get; set; }
        public string Product { get; set; } = string.Empty;
        public int FarmerId { get; set; }
        public int BuyerId { get; set; }
        public string Buyer { get; set; } = string.Empty;
        public string Initials { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
        public string? Reply { get; set; }
        public DateTime Date { get; set; }
    }

    public class CreateReviewRequest
    {
        public int? ProduceId { get; set; }
        public int FarmerId { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
    }

    public class ReplyReviewRequest
    {
        public string Reply { get; set; } = string.Empty;
    }

    public class RatingDistributionDTO
    {
        public int Stars { get; set; }
        public int Count { get; set; }
    }
}
