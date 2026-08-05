using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WiMakit.API.Models
{
    public class FraudCase
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string CaseNumber { get; set; } = string.Empty; // e.g. "FRD-2041"

        public int? OrderId { get; set; }

        [Required]
        public int BuyerId { get; set; }

        [Required]
        public int FarmerId { get; set; }

        [Required]
        [MaxLength(1000)]
        public string Reason { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [Required]
        [MaxLength(30)]
        public string Status { get; set; } = "Open"; // "Open", "Under Review", "Resolved", "Rejected"

        [MaxLength(100)]
        public string? AssignedTo { get; set; }

        public DateTime ReportedAt { get; set; } = DateTime.UtcNow;

        public DateTime? ResolvedAt { get; set; }

        [ForeignKey("OrderId")]
        public virtual Order? Order { get; set; }

        [ForeignKey("BuyerId")]
        public virtual User? Buyer { get; set; }

        [ForeignKey("FarmerId")]
        public virtual User? Farmer { get; set; }
    }
}
