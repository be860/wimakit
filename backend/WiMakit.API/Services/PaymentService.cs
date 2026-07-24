using WiMakit.API.Data;
using WiMakit.API.Models;
using Microsoft.EntityFrameworkCore;

namespace WiMakit.API.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly AppDbContext _context;

        public PaymentService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> ProcessPaymentAsync(PaymentRequest request)
        {
            // Get produce to find the farmer
            var produce = await _context.Produces.FindAsync(request.ProduceId);
            if (produce == null) return false;

            // Demo payment: Always return success after a short delay
            await Task.Delay(1000);

            // Create order record
            var order = new Order
            {
                BuyerId = request.BuyerId,
                FarmerId = produce.FarmerId,
                ProduceId = request.ProduceId,
                Amount = request.Amount,
                PaymentMethod = request.PaymentMethod,
                AccountNumber = request.AccountNumber,
                Status = "Completed",
                CreatedAt = DateTime.UtcNow
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<IEnumerable<OrderDTO>> GetBuyerOrdersAsync(int buyerId)
        {
            return await _context.Orders
                .Where(o => o.BuyerId == buyerId)
                .Include(o => o.Produce)
                .Include(o => o.Farmer)
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new OrderDTO
                {
                    Id = o.Id,
                    ProduceId = o.ProduceId,
                    ProduceName = o.Produce != null ? o.Produce.Name : "Deleted Product",
                    ProduceImageUrl = o.Produce != null ? o.Produce.ImageUrl : null,
                    Amount = o.Amount,
                    PaymentMethod = o.PaymentMethod,
                    Status = o.Status,
                    CreatedAt = o.CreatedAt,
                    BuyerName = o.Buyer != null ? o.Buyer.Name : "",
                    FarmerName = o.Farmer != null ? o.Farmer.Name : ""
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<OrderDTO>> GetFarmerSalesAsync(int farmerId)
        {
            return await _context.Orders
                .Where(o => o.FarmerId == farmerId)
                .Include(o => o.Produce)
                .Include(o => o.Buyer)
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new OrderDTO
                {
                    Id = o.Id,
                    ProduceId = o.ProduceId,
                    ProduceName = o.Produce != null ? o.Produce.Name : "Deleted Product",
                    ProduceImageUrl = o.Produce != null ? o.Produce.ImageUrl : null,
                    Amount = o.Amount,
                    PaymentMethod = o.PaymentMethod,
                    Status = o.Status,
                    CreatedAt = o.CreatedAt,
                    BuyerName = o.Buyer != null ? o.Buyer.Name : "",
                    FarmerName = o.Farmer != null ? o.Farmer.Name : ""
                })
                .ToListAsync();
        }
    }
}
