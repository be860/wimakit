using Microsoft.EntityFrameworkCore;
using WiMakit.API.Data;
using WiMakit.API.DTOs;
using WiMakit.API.Models;

namespace WiMakit.API.Services
{
    public interface ICategoryService
    {
        Task<List<CategoryDTO>> GetAllAsync();
        Task<CategoryDTO?> GetByIdAsync(int id);
        Task<(bool success, string message, CategoryDTO? category)> CreateAsync(CreateCategoryRequest request);
        Task<(bool success, string message, CategoryDTO? category)> UpdateAsync(int id, UpdateCategoryRequest request);
        Task<(bool success, string message)> ToggleActiveAsync(int id);
        Task<(bool success, string message)> DeleteAsync(int id);
    }

    public class CategoryService : ICategoryService
    {
        private readonly AppDbContext _context;

        public CategoryService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<CategoryDTO>> GetAllAsync()
        {
            var categories = await _context.Categories
                .OrderBy(c => c.Name)
                .ToListAsync();

            // Live product counts per category slug, computed in one query rather than N+1.
            var counts = await _context.Produces
                .GroupBy(p => p.Category)
                .Select(g => new { Slug = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.Slug, x => x.Count);

            return categories.Select(c => MapToDTO(c, counts.GetValueOrDefault(c.Slug, 0))).ToList();
        }

        public async Task<CategoryDTO?> GetByIdAsync(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null) return null;

            var count = await _context.Produces.CountAsync(p => p.Category == category.Slug);
            return MapToDTO(category, count);
        }

        public async Task<(bool success, string message, CategoryDTO? category)> CreateAsync(CreateCategoryRequest request)
        {
            var slug = NormalizeSlug(request.Slug, request.Name);

            if (await _context.Categories.AnyAsync(c => c.Slug == slug))
                return (false, "A category with this slug already exists.", null);

            var category = new Category
            {
                Name = request.Name.Trim(),
                Slug = slug,
                Commission = request.Commission,
                Active = request.Active,
                CreatedAt = DateTime.UtcNow
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return (true, "Category created successfully.", MapToDTO(category, 0));
        }

        public async Task<(bool success, string message, CategoryDTO? category)> UpdateAsync(int id, UpdateCategoryRequest request)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null) return (false, "Category not found.", null);

            var slug = NormalizeSlug(request.Slug, request.Name);
            if (slug != category.Slug && await _context.Categories.AnyAsync(c => c.Slug == slug && c.Id != id))
                return (false, "A category with this slug already exists.", null);

            category.Name = request.Name.Trim();
            category.Slug = slug;
            category.Commission = request.Commission;
            category.Active = request.Active;
            category.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var count = await _context.Produces.CountAsync(p => p.Category == category.Slug);
            return (true, "Category updated successfully.", MapToDTO(category, count));
        }

        public async Task<(bool success, string message)> ToggleActiveAsync(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null) return (false, "Category not found.");

            category.Active = !category.Active;
            category.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return (true, category.Active ? "Category activated." : "Category deactivated.");
        }

        public async Task<(bool success, string message)> DeleteAsync(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null) return (false, "Category not found.");

            var inUse = await _context.Produces.AnyAsync(p => p.Category == category.Slug);
            if (inUse)
                return (false, "This category has products assigned to it. Deactivate it instead of deleting, or reassign those products first.");

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return (true, "Category deleted successfully.");
        }

        private static string NormalizeSlug(string? providedSlug, string name)
        {
            var basis = !string.IsNullOrWhiteSpace(providedSlug) ? providedSlug : name;
            var slug = basis.Trim().ToLowerInvariant();
            slug = System.Text.RegularExpressions.Regex.Replace(slug, @"[^a-z0-9]+", "-");
            slug = slug.Trim('-');
            return slug;
        }

        private static CategoryDTO MapToDTO(Category c, int productCount) => new()
        {
            Id = c.Id,
            Name = c.Name,
            Slug = c.Slug,
            Commission = c.Commission,
            Active = c.Active,
            ProductCount = productCount,
            CreatedAt = c.CreatedAt
        };
    }
}
