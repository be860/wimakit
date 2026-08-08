using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WiMakit.API.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string LastName { get; set; } = string.Empty;

        /// <summary>Computed full display name — never stored in DB.</summary>
        [NotMapped]
        public string FullName => $"{FirstName} {LastName}".Trim();

        [Required]
        [EmailAddress]
        [MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        // Nullable — Google-auth users have no password
        public string? PasswordHash { get; set; }

        /// <summary>Google OAuth subject ID ("sub" claim). Null for email/password users.</summary>
        [MaxLength(128)]
        public string? GoogleId { get; set; }

        [Required]
        [MaxLength(20)]
        public string Role { get; set; } = "buyer"; // "farmer", "buyer", "admin" / "superadmin"

        [MaxLength(20)]
        public string? Phone { get; set; }

        [MaxLength(100)]
        public string? Location { get; set; }

        // Additional Profile Fields
        [MaxLength(50)]
        public string? NIN { get; set; }

        /// <summary>Type of ID document uploaded: "National ID", "Voter Card", or "Passport".</summary>
        [MaxLength(30)]
        public string? IdDocumentType { get; set; }

        /// <summary>Supabase Storage URL of the front image of the uploaded ID document.</summary>
        [MaxLength(500)]
        public string? IdDocumentFrontUrl { get; set; }

        /// <summary>Supabase Storage URL of the back image of the uploaded ID document.</summary>
        [MaxLength(500)]
        public string? IdDocumentBackUrl { get; set; }

        /// <summary>Supabase Storage URL of the farmer's profile photo.</summary>
        [MaxLength(500)]
        public string? ProfilePhotoUrl { get; set; }

        /// <summary>Supabase Storage URL of a photo of the farmer's farm.</summary>
        [MaxLength(500)]
        public string? FarmPhotoUrl { get; set; }

        [MaxLength(50)]
        public string? District { get; set; }

        [MaxLength(50)]
        public string? Chiefdom { get; set; }

        [MaxLength(50)]
        public string? Community { get; set; }

        [MaxLength(100)]
        public string? FarmName { get; set; }

        [MaxLength(200)]
        public string? FarmAddress { get; set; }

        [MaxLength(50)]
        public string? FarmSize { get; set; }

        [MaxLength(50)]
        public string? FarmingExperience { get; set; }

        public string? PrimaryCrops { get; set; } // e.g. "Cassava, Groundnut, Rice"

        public string? FarmDescription { get; set; }

        // Buyer specific fields
        [MaxLength(100)]
        public string? BusinessName { get; set; }

        [MaxLength(50)]
        public string? BusinessType { get; set; }

        // Trust & Administrative Approval Fields
        public int TrustScore { get; set; } = 75;

        [Required]
        [MaxLength(30)]
        public string VerificationStatus { get; set; } = "Pending"; // "Pending", "Approved", "Rejected", "Suspended"

        [Required]
        [MaxLength(30)]
        public string Status { get; set; } = "Active"; // "Active", "Suspended"

        [MaxLength(100)]
        public string? ApprovedBy { get; set; }

        public DateTime? ApprovalDate { get; set; }

        public bool IsEmailVerified { get; set; } = false;

        public bool MustChangePassword { get; set; } = false;

        public string? EmailVerificationToken { get; set; }

        public DateTime? EmailVerificationExpiry { get; set; }

        /// <summary>6-digit OTP code issued for a "forgot password" request. Cleared once used or expired.</summary>
        public string? PasswordResetToken { get; set; }

        public DateTime? PasswordResetExpiry { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual ICollection<Produce> Produces { get; set; } = new List<Produce>();
        public virtual ICollection<Message> SentMessages { get; set; } = new List<Message>();
        public virtual ICollection<Message> ReceivedMessages { get; set; } = new List<Message>();
        public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    }
}
