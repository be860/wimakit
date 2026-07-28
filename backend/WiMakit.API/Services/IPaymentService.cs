using System.ComponentModel.DataAnnotations;
using WiMakit.API.Models;

namespace WiMakit.API.Services
{
    public interface IPaymentService
    {
        Task<PaymentResult> ProcessPaymentAsync(PaymentRequest request);
        Task<IEnumerable<OrderDTO>> GetBuyerOrdersAsync(int buyerId);
        Task<IEnumerable<OrderDTO>> GetFarmerSalesAsync(int farmerId);
    }

    public class PaymentRequest
    {
        [Required(ErrorMessage = "Produce ID is required.")]
        [Range(1, int.MaxValue)]
        public int ProduceId { get; set; }

        [Required(ErrorMessage = "Quantity is required.")]
        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1.")]
        public int Quantity { get; set; }

        [Required(ErrorMessage = "Payment method is required.")]
        public string PaymentMethod { get; set; } = string.Empty; // AfriMoney, OrangeMoney, QMoney, SLCB, Rokel, GTBank

        [Required(ErrorMessage = "Account/Phone number is required.")]
        [MaxLength(50)]
        public string AccountNumber { get; set; } = string.Empty;

        public int BuyerId { get; set; }

        // Note: Amount is intentionally NOT accepted from the client.
        // The server computes it from Produce.Price * Quantity so a buyer
        // can never submit an arbitrary price. See PaymentService.ProcessPaymentAsync.
    }

    public class PaymentResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    public class OrderDTO
    {
        public int Id { get; set; }
        public int ProduceId { get; set; }
        public string ProduceName { get; set; } = string.Empty;
        public string? ProduceImageUrl { get; set; }
        public int Quantity { get; set; }
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string BuyerName { get; set; } = string.Empty;
        public string FarmerName { get; set; } = string.Empty;
    }
}
