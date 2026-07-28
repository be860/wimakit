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

        public async Task<PaymentResult> ProcessPaymentAsync(PaymentRequest request)
        {
            var produce = await _context.Produces.FindAsync(request.ProduceId);
            if (produce == null)
                return new PaymentResult { Success = false, Message = "Produce not found." };

            if (produce.Status != "available")
                return new PaymentResult { Success = false, Message = "This produce is no longer available." };

            if (request.Quantity > produce.Quantity)
            {
                return new PaymentResult
                {
                    Success = false,
                    Message = produce.Quantity > 0
                        ? $"Only {produce.Quantity} {produce.Unit} left in stock."
                        : "This produce is out of stock."
                };
            }

            // Server-computed amount — never trust a client-supplied price.
            var amount = produce.Price * request.Quantity;

            // Demo payment gateway simulation. Replace this delay with a real
            // provider call (AfriMoney/Orange Money/bank API) before production;
            // right now every payment "succeeds" once stock/availability checks pass.
            await Task.Delay(1000);

            var order = new Order
            {
                BuyerId = request.BuyerId,
                FarmerId = produce.FarmerId,
                ProduceId = request.ProduceId,
                Quantity = request.Quantity,
                Amount = amount,
                PaymentMethod = request.PaymentMethod,
                AccountNumber = request.AccountNumber,
                Status = "Completed",
                CreatedAt = DateTime.UtcNow
            };

            _context.Orders.Add(order);

            produce.Quantity -= request.Quantity;
            if (produce.Quantity <= 0)
            {
                produce.Quantity = 0;
                produce.Status = "sold";
            }
            produce.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return new PaymentResult { Success = true, Message = "Payment successful" };
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
                    Quantity = o.Quantity,
                    ProduceName = o.Produce != null ? o.Produce.Name : "Deleted Product",
                    ProduceImageUrl = o.Produce != null ? o.Produce.ImageUrl : null,
                    Amount = o.Amount,
                    PaymentMethod = o.PaymentMethod,
                    Status = o.Status,
                    CreatedAt = o.CreatedAt,
                    BuyerName = o.Buyer != null ? o.Buyer.FullName : "",
                    FarmerName = o.Farmer != null ? o.Farmer.FullName : ""
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
                    Quantity = o.Quantity,
                    ProduceName = o.Produce != null ? o.Produce.Name : "Deleted Product",
                    ProduceImageUrl = o.Produce != null ? o.Produce.ImageUrl : null,
                    Amount = o.Amount,
                    PaymentMethod = o.PaymentMethod,
                    Status = o.Status,
                    CreatedAt = o.CreatedAt,
                    BuyerName = o.Buyer != null ? o.Buyer.FullName : "",
                    FarmerName = o.Farmer != null ? o.Farmer.FullName : ""
                })
                .ToListAsync();
        }
    }
}
