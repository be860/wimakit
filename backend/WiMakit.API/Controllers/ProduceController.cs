using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using WiMakit.API.Data;
using WiMakit.API.DTOs;
using WiMakit.API.Models;
using WiMakit.API.Services;

namespace WiMakit.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProduceController : ControllerBase
    {
        private readonly IProduceService _produceService;
        
        public ProduceController(IProduceService produceService)
        {
            _produceService = produceService;
        }
        [Authorize]
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<ProduceDTO>>> GetAllProduce(
            [FromQuery] string? search,
            [FromQuery] string? category)
        {
            var produces = await _produceService.GetAllProduceAsync(search, category);
            return Ok(produces);
        }

        [Authorize]
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<ProduceDTO>> GetProduceById(int id)
        {
            var produce = await _produceService.GetProduceByIdAsync(id);
            
            if (produce == null)
            {
                return NotFound(new { message = "Produce not found" });
            }
            
            return Ok(produce);
        }

        [Authorize]
        [HttpGet("farmer/{farmerId}")]
        public async Task<ActionResult<IEnumerable<ProduceDTO>>> GetFarmerProduce(int farmerId)
        {
            var produces = await _produceService.GetFarmerProduceAsync(farmerId);
            return Ok(produces);
        }
        
        [HttpPost]
        [Authorize(Roles = "farmer")]
        public async Task<ActionResult<ProduceDTO>> CreateProduce(CreateProduceRequest request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var produce = await _produceService.CreateProduceAsync(userId, request);
            
            return CreatedAtAction(nameof(GetProduceById), new { id = produce.Id }, produce);
        }

        [Authorize]
        [HttpPut("{id}")]
        [Authorize(Roles = "farmer")]
        public async Task<ActionResult<ProduceDTO>> UpdateProduce(int id, UpdateProduceRequest request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var produce = await _produceService.UpdateProduceAsync(id, userId, request);
            
            if (produce == null)
            {
                return NotFound(new { message = "Produce not found or you don't have permission to update it" });
            }
            
            return Ok(produce);
        }

        [Authorize]
        [HttpDelete("{id}")]
        [Authorize(Roles = "farmer")]
        public async Task<IActionResult> DeleteProduce(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var result = await _produceService.DeleteProduceAsync(id, userId);
            
            if (!result)
            {
                return NotFound(new { message = "Produce not found or you don't have permission to delete it" });
            }
            
            return NoContent();
        }
    }
}
