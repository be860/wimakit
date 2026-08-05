using WiMakit.API.DTOs;
using WiMakit.API.Models;

namespace WiMakit.API.Services
{
    public interface IProduceService
    {
        Task<IEnumerable<ProduceDTO>> GetAllProduceAsync(string? search, string? category);
        Task<ProduceDTO?> GetProduceByIdAsync(int id);
        Task<IEnumerable<ProduceDTO>> GetFarmerProduceAsync(int farmerId);
        Task<ProduceDTO> CreateProduceAsync(int farmerId, CreateProduceRequest request);
        Task<ProduceDTO?> UpdateProduceAsync(int id, int farmerId, UpdateProduceRequest request);
        Task<bool> DeleteProduceAsync(int id, int farmerId);
    }
}
