using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WiMakit.API.Models
{
    public class Category
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        /// <summary>URL-safe identifier, unique, used to tag Produce.Category.</summary>
        [Required]
        [MaxLength(100)]
        public string Slug { get; set; } = string.Empty;

        /// <summary>Marketplace commission rate for this category, as a percentage (e.g. 5.0 = 5%).</summary>
        [Column(TypeName = "decimal(5,2)")]
        public decimal Commission { get; set; }

        /// <summary>Inactive categories are hidden from farmers when listing new produce.</summary>
        public bool Active { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }
    }
}
