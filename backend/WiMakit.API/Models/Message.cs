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
