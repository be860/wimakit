using System.ComponentModel.DataAnnotations;

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
        [System.ComponentModel.DataAnnotations.Schema.NotMapped]
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
        public string Role { get; set; } = "buyer"; // "farmer" or "buyer"

        [MaxLength(20)]
        public string? Phone { get; set; }

        [MaxLength(100)]
        public string? Location { get; set; }

        // Farmer specific fields
        public string? FarmSize { get; set; }
        public string? FarmingExperience { get; set; }

        // Buyer specific fields
        public string? BusinessName { get; set; }
        public string? BusinessType { get; set; }

        public bool IsEmailVerified { get; set; } = false;

        public string? EmailVerificationToken { get; set; }

        public DateTime? EmailVerificationExpiry { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual ICollection<Produce> Produces { get; set; } = new List<Produce>();
        public virtual ICollection<Message> SentMessages { get; set; } = new List<Message>();
        public virtual ICollection<Message> ReceivedMessages { get; set; } = new List<Message>();
        public virtual ICollection<RefreshToken> RefreshTokens { get; set; }
    = new List<RefreshToken>();
    }
}
