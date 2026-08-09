using System.ComponentModel.DataAnnotations;

namespace WiMakit.API.DTOs
{
    public class PlatformSettingsDTO
    {
        public string PlatformName { get; set; } = string.Empty;
        public string SupportEmail { get; set; } = string.Empty;
        public string DisplayCurrency { get; set; } = string.Empty;
        public decimal BaseCommission { get; set; }
        public string PayoutSchedule { get; set; } = string.Empty;
        public decimal ManualReviewThreshold { get; set; }
        public bool RequireNinVerification { get; set; }
        public bool AutoHoldHighValueOrders { get; set; }
        public bool RequireTwoFactorForStaff { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? UpdatedBy { get; set; }
    }

    public class UpdatePlatformSettingsRequest
    {
        [Required(ErrorMessage = "Platform name is required.")]
        [MaxLength(100)]
        public string PlatformName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Support email is required.")]
        [EmailAddress]
        [MaxLength(100)]
        public string SupportEmail { get; set; } = string.Empty;

        [Required]
        [RegularExpression("^(sll|usd)$", ErrorMessage = "Currency must be 'sll' or 'usd'.")]
        public string DisplayCurrency { get; set; } = "sll";

        [Range(0, 100, ErrorMessage = "Base commission must be between 0 and 100.")]
        public decimal BaseCommission { get; set; }

        [Required]
        [RegularExpression("^(daily|weekly|biweekly)$", ErrorMessage = "Payout schedule must be daily, weekly, or biweekly.")]
        public string PayoutSchedule { get; set; } = "weekly";

        [Range(0, double.MaxValue, ErrorMessage = "Threshold must be a positive amount.")]
        public decimal ManualReviewThreshold { get; set; }

        public bool RequireNinVerification { get; set; }
        public bool AutoHoldHighValueOrders { get; set; }
        public bool RequireTwoFactorForStaff { get; set; }
    }
}
