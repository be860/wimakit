using WiMakit.API.Models;

namespace WiMakit.API.Services
{
    public interface IPaymentService
    {
        Task<bool> ProcessPaymentAsync(PaymentRequest request);
        Task<IEnumerable<OrderDTO>> GetBuyerOrdersAsync(int buyerId);
        Task<IEnumerable<OrderDTO>> GetFarmerSalesAsync(int farmerId);
    }

    public class PaymentRequest
    {
        public int ProduceId { get; set; }
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } // AfriMoney, OrangeMoney, QMoney, SLCB, Rokel, GTBank
        public string AccountNumber { get; set; }
        public int BuyerId { get; set; }
    }

    public class OrderDTO
    {
        public int Id { get; set; }
        public int ProduceId { get; set; }
        public string ProduceName { get; set; } = string.Empty;
        public string? ProduceImageUrl { get; set; }
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string BuyerName { get; set; } = string.Empty;
        public string FarmerName { get; set; } = string.Empty;
    }
}
