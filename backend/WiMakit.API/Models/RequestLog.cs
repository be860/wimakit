using System.ComponentModel.DataAnnotations;

namespace WiMakit.API.Models
{
    /// <summary>
    /// One row per HTTP request handled by the API, written by RequestAuditMiddleware.
    /// This is the full system audit trail (every request, any user, any role) —
    /// distinct from AuditLog, which only records curated privileged admin actions.
    /// </summary>
    public class RequestLog
    {
        [Key]
        public long Id { get; set; }

        [Required]
        [MaxLength(10)]
        public string Method { get; set; } = string.Empty;

        [Required]
        [MaxLength(300)]
        public string Path { get; set; } = string.Empty;

        public string? QueryString { get; set; }

        public int StatusCode { get; set; }

        public long DurationMs { get; set; }

        /// <summary>Null for unauthenticated requests.</summary>
        public int? UserId { get; set; }

        [MaxLength(100)]
        public string? UserEmail { get; set; }

        [MaxLength(20)]
        public string? UserRole { get; set; }

        [MaxLength(64)]
        public string? IpAddress { get; set; }

        [MaxLength(300)]
        public string? UserAgent { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
