using WiMakit.API.Data;
using WiMakit.API.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;

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

            if (produce.Status == "sold" || produce.Status == "Hidden" || produce.Status == "Rejected")
                return new PaymentResult { Success = false, Message = "This produce is no longer available for purchase." };

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

            var amount = produce.Price * request.Quantity;
            var orderNumber = $"WM-ORD-{RandomNumberGenerator.GetInt32(1000, 9999)}";
            var paymentRef = $"PAY-{RandomNumberGenerator.GetInt32(1000, 9999)}-SL";

            var order = new Order
            {
                OrderNumber = orderNumber,
                BuyerId = request.BuyerId,
                FarmerId = produce.FarmerId,
                ProduceId = request.ProduceId,
                Quantity = request.Quantity,
                Amount = amount,
                PaymentMethod = request.PaymentMethod,
                AccountNumber = request.AccountNumber,
                District = request.District ?? produce.District ?? produce.Location,
                DeliveryAddress = request.DeliveryAddress ?? "Local Market Delivery",
                PaymentRef = paymentRef,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            _context.Orders.Add(order);

            produce.Quantity -= request.Quantity;
            produce.Stock = Math.Max(0, produce.Stock - request.Quantity);
            if (produce.Quantity <= 0)
            {
                produce.Quantity = 0;
                produce.Status = "sold";
            }
            produce.UpdatedAt = DateTime.UtcNow;

            // Notify farmer
            _context.Notifications.Add(new Notification
            {
                UserId = produce.FarmerId,
                Type = "order",
                Title = "New order received",
                Body = $"Order {orderNumber} placed for {request.Quantity} {produce.Unit} of {produce.Name}.",
                IsUnread = true,
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();

            return new PaymentResult
            {
                Success = true,
                Message = "Payment processed successfully.",
                OrderNumber = orderNumber
            };
        }

        public async Task<IEnumerable<OrderDTO>> GetBuyerOrdersAsync(int buyerId)
        {
            return await _context.Orders
                .Where(o => o.BuyerId == buyerId)
                .Include(o => o.Produce)
                .Include(o => o.Farmer)
                .Include(o => o.Buyer)
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => MapToDTO(o))
                .ToListAsync();
        }

        public async Task<IEnumerable<OrderDTO>> GetFarmerSalesAsync(int farmerId)
        {
            return await _context.Orders
                .Where(o => o.FarmerId == farmerId)
                .Include(o => o.Produce)
                .Include(o => o.Buyer)
                .Include(o => o.Farmer)
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => MapToDTO(o))
                .ToListAsync();
        }

        public async Task<bool> UpdateOrderStatusAsync(int orderId, int userId, string newStatus)
        {
            var order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == orderId && (o.FarmerId == userId || o.BuyerId == userId));
            if (order == null) return false;

            order.Status = newStatus;

            // Notify buyer on status change
            _context.Notifications.Add(new Notification
            {
                UserId = order.BuyerId,
                Type = "order",
                Title = $"Order status updated to {newStatus}",
                Body = $"Your order {order.OrderNumber} is now {newStatus}.",
                IsUnread = true,
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            return true;
        }

        private static OrderDTO MapToDTO(Order o)
        {
            var buyerName = o.Buyer != null ? o.Buyer.FullName : "Unknown Buyer";
            var farmerName = o.Farmer != null ? o.Farmer.FullName : "Unknown Farmer";
            var unit = o.Produce != null ? o.Produce.Unit : "kg";

            return new OrderDTO
            {
                Id = o.Id,
                OrderNumber = !string.IsNullOrEmpty(o.OrderNumber) ? o.OrderNumber : $"WM-ORD-{o.Id:D4}",
                ProduceId = o.ProduceId,
                ProduceName = o.Produce != null ? o.Produce.Name : "Deleted Product",
                ProduceImageUrl = o.Produce != null ? o.Produce.ImageUrl : null,
                Quantity = o.Quantity,
                QuantityText = $"{o.Quantity} {unit}",
                Amount = o.Amount,
                PaymentMethod = o.PaymentMethod,
                District = o.District,
                DeliveryAddress = o.DeliveryAddress,
                PaymentRef = o.PaymentRef,
                Status = o.Status,
                CreatedAt = o.CreatedAt,
                BuyerId = o.BuyerId,
                BuyerName = buyerName,
                BuyerInitials = GetInitials(buyerName),
                FarmerId = o.FarmerId,
                FarmerName = farmerName
            };
        }

        private static string GetInitials(string name)
        {
            if (string.IsNullOrWhiteSpace(name)) return "U";
            var parts = name.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length == 1) return parts[0][..1].ToUpper();
            return $"{parts[0][0]}{parts[1][0]}".ToUpper();
        }
    }
}
