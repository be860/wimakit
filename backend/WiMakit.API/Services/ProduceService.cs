using WiMakit.API.Data;
using WiMakit.API.DTOs;
using WiMakit.API.Models;
using Microsoft.EntityFrameworkCore;

namespace WiMakit.API.Services
{
    public class ProduceService : IProduceService
    {
        private readonly AppDbContext _context;

        public ProduceService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ProduceDTO>> GetAllProduceAsync(string? search, string? category)
        {
            var query = _context.Produces
                .Include(p => p.Farmer)
                .Where(p => p.Status == "available")
                .AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(p => p.Name.Contains(search) || p.Description.Contains(search));
            }

            if (!string.IsNullOrEmpty(category) && category != "all")
            {
                query = query.Where(p => p.Category == category);
            }

            return await query
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => MapProduceToDTO(p))
                .ToListAsync();
        }

        public async Task<ProduceDTO?> GetProduceByIdAsync(int id)
        {
            var produce = await _context.Produces
                .Include(p => p.Farmer)
                .FirstOrDefaultAsync(p => p.Id == id);

            return produce != null ? MapProduceToDTO(produce) : null;
        }

        public async Task<IEnumerable<ProduceDTO>> GetFarmerProduceAsync(int farmerId)
        {
            return await _context.Produces
                .Include(p => p.Farmer)
                .Where(p => p.FarmerId == farmerId)
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => MapProduceToDTO(p))
                .ToListAsync();
        }

        public async Task<ProduceDTO> CreateProduceAsync(int farmerId, CreateProduceRequest request)
        {
            var produce = new Produce
            {
                FarmerId = farmerId,
                Name = request.Name,
                Category = request.Category,
                Description = request.Description,
                Price = request.Price,
                Unit = request.Unit,
                Quantity = request.Quantity,
                Location = request.Location,
                ImageUrl = request.ImageUrl,
                Status = "available"
            };

            _context.Produces.Add(produce);
            await _context.SaveChangesAsync();

            // Load farmer data
            await _context.Entry(produce).Reference(p => p.Farmer).LoadAsync();

            return MapProduceToDTO(produce);
        }

        public async Task<ProduceDTO?> UpdateProduceAsync(int id, int farmerId, UpdateProduceRequest request)
        {
            var produce = await _context.Produces
                .Include(p => p.Farmer)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (produce == null || produce.FarmerId != farmerId)
            {
                return null;
            }

            // Update fields
            if (!string.IsNullOrEmpty(request.Name)) produce.Name = request.Name;
            if (!string.IsNullOrEmpty(request.Category)) produce.Category = request.Category;
            if (!string.IsNullOrEmpty(request.Description)) produce.Description = request.Description;
            if (request.Price.HasValue) produce.Price = request.Price.Value;
            if (!string.IsNullOrEmpty(request.Unit)) produce.Unit = request.Unit;
            if (request.Quantity.HasValue) produce.Quantity = request.Quantity.Value;
            if (request.Location != null) produce.Location = request.Location;
            if (request.ImageUrl != null) produce.ImageUrl = request.ImageUrl;
            if (!string.IsNullOrEmpty(request.Status)) produce.Status = request.Status;

            produce.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return MapProduceToDTO(produce);
        }

        public async Task<bool> DeleteProduceAsync(int id, int farmerId)
        {
            var produce = await _context.Produces.FirstOrDefaultAsync(p => p.Id == id);

            if (produce == null || produce.FarmerId != farmerId)
            {
                return false;
            }

            _context.Produces.Remove(produce);
            await _context.SaveChangesAsync();

            return true;
        }

        private static ProduceDTO MapProduceToDTO(Produce produce)
        {
            return new ProduceDTO
            {
                Id = produce.Id,
                FarmerId = produce.FarmerId,
                FarmerName = produce.Farmer?.FullName ?? "",
                FarmerLocation = produce.Farmer?.Location ?? "",
                Name = produce.Name,
                Category = produce.Category,
                Description = produce.Description,
                Price = produce.Price,
                Unit = produce.Unit,
                Quantity = produce.Quantity,
                Location = produce.Location,
                ImageUrl = produce.ImageUrl,
                Status = produce.Status,
                CreatedAt = produce.CreatedAt
            };
        }
    }
}
