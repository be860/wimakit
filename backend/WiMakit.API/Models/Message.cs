using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WiMakit.API.Models
{
    public class Message
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int SenderId { get; set; }
        
        [Required]
        public int ReceiverId { get; set; }
        
        public int? ProduceId { get; set; }

        [Required]
        public string Content { get; set; } = string.Empty;

        // "text" | "voice" | "image"
        public string MessageType { get; set; } = "text";

        public string? AttachmentUrl { get; set; }

        // Only set for voice messages — recorded length, so the UI can show it
        // without downloading/decoding the audio file.
        public int? AttachmentDurationSeconds { get; set; }

        public bool IsEdited { get; set; } = false;

        public DateTime? EditedAt { get; set; }

        public bool IsDeleted { get; set; } = false;

        public DateTime? DeletedAt { get; set; }

        public bool IsRead { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("SenderId")]
        public virtual User? Sender { get; set; }
        
        [ForeignKey("ReceiverId")]
        public virtual User? Receiver { get; set; }
        
        [ForeignKey("ProduceId")]
        public virtual Produce? Produce { get; set; }
    }
}
