using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WiMakit.API.Models
{
    public class Produce
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int FarmerId { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(50)]
        public string Category { get; set; } = string.Empty;
        
        [Required]
        public string Description { get; set; } = string.Empty;
        
        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }
        
        [Required]
        [MaxLength(20)]
        public string Unit { get; set; } = "kg";
        
        [Required]
        public int Quantity { get; set; }
        
        [MaxLength(100)]
        public string? Location { get; set; }
        
        public string? ImageUrl { get; set; }
        
        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "available"; // "available", "sold", "inactive"
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? UpdatedAt { get; set; }
        
        // Navigation properties
        [ForeignKey("FarmerId")]
        public virtual User? Farmer { get; set; }
    }
}
