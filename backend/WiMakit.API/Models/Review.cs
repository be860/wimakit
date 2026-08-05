using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WiMakit.API.Models
{
    public class Review
    {
        [Key]
        public int Id { get; set; }

        public int? ProduceId { get; set; }

        [Required]
        public int FarmerId { get; set; }

        [Required]
        public int BuyerId { get; set; }

        [Required]
        [MaxLength(100)]
        public string BuyerName { get; set; } = string.Empty;

        [Range(1, 5)]
        public int Rating { get; set; }

        [Required]
        [MaxLength(1000)]
        public string Comment { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Reply { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("ProduceId")]
        public virtual Produce? Produce { get; set; }

        [ForeignKey("FarmerId")]
        public virtual User? Farmer { get; set; }

        [ForeignKey("BuyerId")]
        public virtual User? Buyer { get; set; }
    }
}
