using System.ComponentModel.DataAnnotations;

namespace WiMakit.API.DTOs
{
    public class CreateProduceRequest
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        public string Category { get; set; } = string.Empty;
        
        [Required]
        public string Description { get; set; } = string.Empty;
        
        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Price { get; set; }
        
        [Required]
        public string Unit { get; set; } = "kg";
        
        [Required]
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }
        
        public string? Location { get; set; }
        public string? ImageUrl { get; set; }
    }
    
    public class UpdateProduceRequest
    {
        public string? Name { get; set; }
        public string? Category { get; set; }
        public string? Description { get; set; }
        public decimal? Price { get; set; }
        public string? Unit { get; set; }
        public int? Quantity { get; set; }
        public string? Location { get; set; }
        public string? ImageUrl { get; set; }
        public string? Status { get; set; }
    }
    
    public class ProduceDTO
    {
        public int Id { get; set; }
        public int FarmerId { get; set; }
        public string FarmerName { get; set; } = string.Empty;
        public string FarmerLocation { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Unit { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public string? Location { get; set; }
        public string? ImageUrl { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
