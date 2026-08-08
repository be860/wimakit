using System.ComponentModel.DataAnnotations;

namespace WiMakit.API.DTOs
{
    public class CreateProduceRequest
    {
        [Required(ErrorMessage = "Produce name is required.")]
        [MaxLength(100, ErrorMessage = "Produce name cannot exceed 100 characters.")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Category is required.")]
        [MaxLength(50, ErrorMessage = "Category cannot exceed 50 characters.")]
        public string Category { get; set; } = string.Empty;

        [Required(ErrorMessage = "Description is required.")]
        [MaxLength(1000, ErrorMessage = "Description cannot exceed 1000 characters.")]
        public string Description { get; set; } = string.Empty;

        [Required(ErrorMessage = "Price is required.")]
        [Range(0.01, 100000000.00, ErrorMessage = "Price must be greater than zero.")]
        public decimal Price { get; set; }

        [Required(ErrorMessage = "Unit is required.")]
        [MaxLength(20, ErrorMessage = "Unit cannot exceed 20 characters.")]
        public string Unit { get; set; } = "kg";

        [Required(ErrorMessage = "Quantity is required.")]
        [Range(1, 1000000, ErrorMessage = "Quantity must be at least 1.")]
        public int Quantity { get; set; }

        [MaxLength(100, ErrorMessage = "Location cannot exceed 100 characters.")]
        public string? Location { get; set; }

        [Url(ErrorMessage = "Image URL must be a valid URL.")]
        public string? ImageUrl { get; set; }
    }

    public class UpdateProduceRequest
    {
        [MaxLength(100, ErrorMessage = "Produce name cannot exceed 100 characters.")]
        public string? Name { get; set; }

        [MaxLength(50, ErrorMessage = "Category cannot exceed 50 characters.")]
        public string? Category { get; set; }

        [MaxLength(1000, ErrorMessage = "Description cannot exceed 1000 characters.")]
        public string? Description { get; set; }

        [Range(0.01, 100000000.00, ErrorMessage = "Price must be greater than zero.")]
        public decimal? Price { get; set; }

        [MaxLength(20, ErrorMessage = "Unit cannot exceed 20 characters.")]
        public string? Unit { get; set; }

        [Range(1, 1000000, ErrorMessage = "Quantity must be at least 1.")]
        public int? Quantity { get; set; }

        [MaxLength(100, ErrorMessage = "Location cannot exceed 100 characters.")]
        public string? Location { get; set; }

        [Url(ErrorMessage = "Image URL must be a valid URL.")]
        public string? ImageUrl { get; set; }

        // Note: farmers cannot set Status directly through this endpoint — that would let a
        // listing skip admin moderation. Status is only ever changed by ProduceService (moving
        // an edited "Live" listing back to "Pending" for re-review) or by an admin via
        // AdminController's product-status/product endpoints.
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
