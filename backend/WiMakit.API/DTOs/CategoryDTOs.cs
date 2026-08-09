using System.ComponentModel.DataAnnotations;

namespace WiMakit.API.DTOs
{
    public class CategoryDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public decimal Commission { get; set; }
        public bool Active { get; set; }
        /// <summary>Live count of Produce rows tagged with this category's slug.</summary>
        public int ProductCount { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateCategoryRequest
    {
        [Required(ErrorMessage = "Category name is required.")]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        /// <summary>Optional — auto-generated from Name if omitted.</summary>
        [MaxLength(100)]
        public string? Slug { get; set; }

        [Range(0, 100, ErrorMessage = "Commission must be between 0 and 100.")]
        public decimal Commission { get; set; }

        public bool Active { get; set; } = true;
    }

    public class UpdateCategoryRequest
    {
        [Required(ErrorMessage = "Category name is required.")]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Slug { get; set; }

        [Range(0, 100, ErrorMessage = "Commission must be between 0 and 100.")]
        public decimal Commission { get; set; }

        public bool Active { get; set; } = true;
    }
}
