using Microsoft.EntityFrameworkCore;
using WiMakit.API.Data;
using WiMakit.API.DTOs;
using WiMakit.API.Models;

namespace WiMakit.API.Services
{
    public interface IFraudService
    {
        Task<(BuyerFraudCaseDTO? Case, string? Error)> ReportFraudAsync(int buyerId, CreateFraudCaseRequest request);
        Task<IEnumerable<BuyerFraudCaseDTO>> GetMyFraudCasesAsync(int buyerId);
    }

    public class FraudService : IFraudService
    {
        private readonly AppDbContext _context;

        public FraudService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<(BuyerFraudCaseDTO? Case, string? Error)> ReportFraudAsync(int buyerId, CreateFraudCaseRequest request)
        {
            var order = await _context.Orders
                .Include(o => o.Farmer)
                .Include(o => o.Produce)
                .FirstOrDefaultAsync(o => o.Id == request.OrderId);

            if (order == null)
            {
                return (null, "Order not found.");
            }

            // Buyers can only report fraud on their own orders.
            if (order.BuyerId != buyerId)
            {
                return (null, "You can only report an issue on your own orders.");
            }

            // Avoid duplicate open reports for the same order.
            var existing = await _context.FraudCases
                .Include(f => f.Farmer)
                .Include(f => f.Order)
                .FirstOrDefaultAsync(f => f.OrderId == order.Id
                    && f.BuyerId == buyerId
                    && (f.Status == "Open" || f.Status == "Under Review"));

            if (existing != null)
            {
                return (MapToDTO(existing, order), "You already have an open report for this order. Our team is reviewing it.");
            }

            var fraudCase = new FraudCase
            {
                OrderId = order.Id,
                BuyerId = buyerId,
                FarmerId = order.FarmerId,
                Reason = request.Reason.Trim(),
                Amount = order.Amount,
                Status = "Open",
                ReportedAt = DateTime.UtcNow,
            };

            _context.FraudCases.Add(fraudCase);
            await _context.SaveChangesAsync();

            // Case number derived from the generated Id, mirroring the WM-ORD-#### order number pattern.
            fraudCase.CaseNumber = $"FRD-{fraudCase.Id:D4}";
            await _context.SaveChangesAsync();

            return (MapToDTO(fraudCase, order), null);
        }

        public async Task<IEnumerable<BuyerFraudCaseDTO>> GetMyFraudCasesAsync(int buyerId)
        {
            var cases = await _context.FraudCases
                .Include(f => f.Farmer)
                .Include(f => f.Order)
                    .ThenInclude(o => o!.Produce)
                .Where(f => f.BuyerId == buyerId)
                .OrderByDescending(f => f.ReportedAt)
                .ToListAsync();

            return cases.Select(f => MapToDTO(f, f.Order));
        }

        private static BuyerFraudCaseDTO MapToDTO(FraudCase f, Order? order)
        {
            var farmerName = order?.Farmer?.FullName ?? f.Farmer?.FullName ?? "Unknown Farmer";

            return new BuyerFraudCaseDTO
            {
                Id = f.Id,
                CaseNumber = f.CaseNumber,
                OrderId = f.OrderId,
                OrderNumber = order?.OrderNumber,
                ProduceName = order?.Produce != null ? order.Produce.Name : "N/A",
                FarmerName = farmerName,
                Reason = f.Reason,
                Amount = f.Amount,
                Status = f.Status,
                ReportedAt = f.ReportedAt,
                ResolvedAt = f.ResolvedAt,
            };
        }
    }
}
