using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WiMakit.API.Models
{
    public class AuditLog
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int AdminId { get; set; }

        [Required]
        [MaxLength(100)]
        public string AdminName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Action { get; set; } = string.Empty; // e.g. "APPROVE_FARMER", "SUSPEND_BUYER"

        [MaxLength(50)]
        public string? TargetType { get; set; } // "Farmer", "Product", "Buyer", "FraudCase"

        public string? TargetId { get; set; }

        public string? Details { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("AdminId")]
        public virtual User? Admin { get; set; }
    }
}
