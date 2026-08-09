using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WiMakit.API.DTOs;
using WiMakit.API.Services;

namespace WiMakit.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryService _categoryService;
        private readonly IAdminService _adminService;

        public CategoriesController(ICategoryService categoryService, IAdminService adminService)
        {
            _categoryService = categoryService;
            _adminService = adminService;
        }

        /// <summary>Anyone signed in can list categories (farmers need this to tag produce).</summary>
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll()
        {
            var categories = await _categoryService.GetAllAsync();
            return Ok(categories);
        }

        [HttpGet("{id:int}")]
        [Authorize]
        public async Task<IActionResult> GetById(int id)
        {
            var category = await _categoryService.GetByIdAsync(id);
            if (category == null) return NotFound(new { message = "Category not found." });
            return Ok(category);
        }

        [HttpPost]
        [Authorize(Policy = "RequireAdmin")]
        public async Task<IActionResult> Create([FromBody] CreateCategoryRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var (success, message, category) = await _categoryService.CreateAsync(request);
            if (!success) return BadRequest(new { message });

            await LogAsync("CREATE_CATEGORY", "Category", category!.Id.ToString(), $"Created category: {category.Name}");
            return CreatedAtAction(nameof(GetById), new { id = category.Id }, category);
        }

        [HttpPut("{id:int}")]
        [Authorize(Policy = "RequireAdmin")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateCategoryRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var (success, message, category) = await _categoryService.UpdateAsync(id, request);
            if (!success) return category == null && message == "Category not found." ? NotFound(new { message }) : BadRequest(new { message });

            await LogAsync("UPDATE_CATEGORY", "Category", id.ToString(), $"Updated category: {category!.Name}");
            return Ok(category);
        }

        [HttpPatch("{id:int}/toggle")]
        [Authorize(Policy = "RequireAdmin")]
        public async Task<IActionResult> ToggleActive(int id)
        {
            var (success, message) = await _categoryService.ToggleActiveAsync(id);
            if (!success) return NotFound(new { message });

            await LogAsync("TOGGLE_CATEGORY", "Category", id.ToString(), message);
            return Ok(new { message });
        }

        [HttpDelete("{id:int}")]
        [Authorize(Policy = "RequireAdmin")]
        public async Task<IActionResult> Delete(int id)
        {
            var (success, message) = await _categoryService.DeleteAsync(id);
            if (!success) return BadRequest(new { message });

            await LogAsync("DELETE_CATEGORY", "Category", id.ToString(), message);
            return Ok(new { message });
        }

        private async Task LogAsync(string action, string targetType, string targetId, string details)
        {
            var adminId = GetCurrentUserId();
            var adminName = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value ?? "Admin";
            await _adminService.WriteAuditLogAsync(action, targetType, targetId, details, adminId, adminName);
        }

        private int GetCurrentUserId()
        {
            var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            return int.TryParse(claim, out int id) ? id : 1;
        }
    }
}
