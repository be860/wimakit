using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WiMakit.API.Models
{
    /// <summary>
    /// Platform-wide configuration. Always exactly one row (Id = 1), seeded on
    /// first read if missing. Edited from the SuperAdmin Settings screen.
    /// </summary>
    public class PlatformSettings
    {
        [Key]
        public int Id { get; set; } = 1;

        [Required]
        [MaxLength(100)]
        public string PlatformName { get; set; } = "WiMakit";

        [Required]
        [MaxLength(100)]
        public string SupportEmail { get; set; } = "support@wimakit.sl";

        [Required]
        [MaxLength(10)]
        public string DisplayCurrency { get; set; } = "sll"; // "sll" | "usd"

        [Column(TypeName = "decimal(5,2)")]
        public decimal BaseCommission { get; set; } = 3.5m;

        [Required]
        [MaxLength(20)]
        public string PayoutSchedule { get; set; } = "weekly"; // "daily" | "weekly" | "biweekly"

        [Column(TypeName = "decimal(18,2)")]
        public decimal ManualReviewThreshold { get; set; } = 10_000_000m;

        public bool RequireNinVerification { get; set; } = true;

        public bool AutoHoldHighValueOrders { get; set; } = true;

        public bool RequireTwoFactorForStaff { get; set; } = false;

        public DateTime? UpdatedAt { get; set; }

        [MaxLength(100)]
        public string? UpdatedBy { get; set; }
    }
}
