using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WiMakit.API.Models
{
    public class Order
    {
        [Key]
        public int Id { get; set; }

        [MaxLength(50)]
        public string OrderNumber { get; set; } = string.Empty; // e.g. "WM-ORD-5821"

        [Required]
        public int BuyerId { get; set; }

        [Required]
        public int FarmerId { get; set; }

        [Required]
        public int ProduceId { get; set; }

        [Required]
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [MaxLength(50)]
        public string? District { get; set; }

        [MaxLength(250)]
        public string? DeliveryAddress { get; set; }

        [MaxLength(50)]
        public string? PaymentRef { get; set; }

        [Required]
        [MaxLength(50)]
        public string PaymentMethod { get; set; } = "Mobile Money";

        [MaxLength(50)]
        public string AccountNumber { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Pending"; // "Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Completed"

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("BuyerId")]
        public virtual User? Buyer { get; set; }

        [ForeignKey("FarmerId")]
        public virtual User? Farmer { get; set; }

        [ForeignKey("ProduceId")]
        public virtual Produce? Produce { get; set; }
    }
}
