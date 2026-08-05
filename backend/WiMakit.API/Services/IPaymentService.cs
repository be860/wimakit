using System.ComponentModel.DataAnnotations;

namespace WiMakit.API.Services
{
    public interface IPaymentService
    {
        Task<PaymentResult> ProcessPaymentAsync(PaymentRequest request);
        Task<IEnumerable<OrderDTO>> GetBuyerOrdersAsync(int buyerId);
        Task<IEnumerable<OrderDTO>> GetFarmerSalesAsync(int farmerId);
        Task<bool> UpdateOrderStatusAsync(int orderId, int userId, string newStatus);
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
        public string PaymentMethod { get; set; } = string.Empty;

        [Required(ErrorMessage = "Account/Phone number is required.")]
        [MaxLength(50)]
        public string AccountNumber { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? District { get; set; }

        [MaxLength(250)]
        public string? DeliveryAddress { get; set; }

        public int BuyerId { get; set; }
    }

    public class PaymentResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? OrderNumber { get; set; }
    }

    public class OrderDTO
    {
        public int Id { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public int ProduceId { get; set; }
        public string ProduceName { get; set; } = string.Empty;
        public string? ProduceImageUrl { get; set; }
        public int Quantity { get; set; }
        public string QuantityText { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public string? District { get; set; }
        public string? DeliveryAddress { get; set; }
        public string? PaymentRef { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int BuyerId { get; set; }
        public string BuyerName { get; set; } = string.Empty;
        public string BuyerInitials { get; set; } = string.Empty;
        public int FarmerId { get; set; }
        public string FarmerName { get; set; } = string.Empty;
    }

    public class UpdateOrderStatusRequest
    {
        [Required]
        public string Status { get; set; } = string.Empty; // "Pending", "Processing", "Shipped", "Delivered", "Cancelled"
    }
}
