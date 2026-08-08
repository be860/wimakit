using WiMakit.API.DTOs;

namespace WiMakit.API.Services
{
    public interface IAdminService
    {
        Task<AdminMetricsDTO> GetAdminMetricsAsync();
        Task<IEnumerable<FarmerAdminDTO>> GetFarmersAsync(string? status, string? search, string? district);
        Task<FarmerAdminDTO?> GetFarmerByIdAsync(int id);
        Task<bool> UpdateFarmerStatusAsync(int id, string status, string? note, int adminId, string adminName);
        Task<IEnumerable<BuyerAdminDTO>> GetBuyersAsync(string? status, string? search);
        Task<bool> UpdateBuyerStatusAsync(int id, string status, int adminId, string adminName);
        Task<IEnumerable<ProductAdminDTO>> GetProductsAsync(string? status, string? search);
        Task<bool> UpdateProductStatusAsync(int id, string status, string? note, int adminId, string adminName);
        Task<ProductAdminDTO> CreateProductAsync(CreateProductAdminRequest request, int adminId, string adminName);
        Task<ProductAdminDTO?> UpdateProductAsync(int id, UpdateProductAdminRequest request, int adminId, string adminName);
        Task<bool> DeleteProductAsync(int id, int adminId, string adminName);
        Task<IEnumerable<FraudCaseDTO>> GetFraudCasesAsync(string? status);
        Task<FraudCaseDTO?> GetFraudCaseByIdAsync(int id);
        Task<bool> UpdateFraudCaseStatusAsync(int id, string status, string? assignedTo, int adminId, string adminName);
        Task<IEnumerable<AuditLogDTO>> GetAuditLogsAsync();
        Task<bool> BroadcastNotificationAsync(BroadcastNotificationRequest request, int adminId, string adminName);
        Task<(bool success, string message, UserDTO? user)> CreateAdminAsync(CreateAdminRequest request, int creatorId, string creatorName);
    }
}
