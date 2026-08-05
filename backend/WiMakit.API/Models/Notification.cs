using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WiMakit.API.Models
{
    public class Notification
    {
        [Key]
        public int Id { get; set; }

        /// <summary>Null means global broadcast to all users</summary>
        public int? UserId { get; set; }

        [Required]
        [MaxLength(30)]
        public string Type { get; set; } = "broadcast"; // "order", "product", "message", "broadcast"

        [Required]
        [MaxLength(150)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(1000)]
        public string Body { get; set; } = string.Empty;

        public bool IsUnread { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("UserId")]
        public virtual User? User { get; set; }
    }
}
