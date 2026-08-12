using System.ComponentModel.DataAnnotations;

namespace WiMakit.API.DTOs
{
    public class CreateFraudCaseRequest
    {
        [Required(ErrorMessage = "Order ID is required.")]
        [Range(1, int.MaxValue, ErrorMessage = "A valid order must be selected.")]
        public int OrderId { get; set; }

        [Required(ErrorMessage = "Please describe the issue.")]
        [MinLength(10, ErrorMessage = "Please provide a bit more detail (at least 10 characters).")]
        [MaxLength(1000, ErrorMessage = "Description cannot exceed 1000 characters.")]
        public string Reason { get; set; } = string.Empty;
    }

    /// <summary>Fraud case shape returned to the buyer who reported it (their own history).</summary>
    public class BuyerFraudCaseDTO
    {
        public int Id { get; set; }
        public string CaseNumber { get; set; } = string.Empty;
        public int? OrderId { get; set; }
        public string? OrderNumber { get; set; }
        public string ProduceName { get; set; } = string.Empty;
        public string FarmerName { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime ReportedAt { get; set; }
        public DateTime? ResolvedAt { get; set; }
    }
}
