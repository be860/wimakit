using Microsoft.EntityFrameworkCore;
using WiMakit.API.Data;
using WiMakit.API.DTOs;

namespace WiMakit.API.Services
{
    public interface IUserService
    {
        Task<UserProfileDTO?> GetProfileAsync(int userId);
        Task<UserProfileDTO?> UpdateProfileAsync(int userId, UpdateUserProfileRequest request);
    }

    public class UserService : IUserService
    {
        private readonly AppDbContext _context;

        public UserService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<UserProfileDTO?> GetProfileAsync(int userId)
        {
            var user = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) return null;

            return MapToDTO(user);
        }

        public async Task<UserProfileDTO?> UpdateProfileAsync(int userId, UpdateUserProfileRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) return null;

            if (!string.IsNullOrEmpty(request.FirstName)) user.FirstName = request.FirstName.Trim();
            if (!string.IsNullOrEmpty(request.LastName)) user.LastName = request.LastName.Trim();
            if (request.Phone != null) user.Phone = request.Phone;
            if (request.Location != null) user.Location = request.Location;
            if (request.Nin != null) user.NIN = request.Nin;
            if (request.District != null) user.District = request.District;
            if (request.Chiefdom != null) user.Chiefdom = request.Chiefdom;
            if (request.Community != null) user.Community = request.Community;
            if (request.FarmName != null) user.FarmName = request.FarmName;
            if (request.FarmAddress != null) user.FarmAddress = request.FarmAddress;
            if (request.FarmSize != null) user.FarmSize = request.FarmSize;
            if (request.FarmingExperience != null) user.FarmingExperience = request.FarmingExperience;
            if (request.PrimaryCrops != null) user.PrimaryCrops = request.PrimaryCrops;
            if (request.FarmDescription != null) user.FarmDescription = request.FarmDescription;
            if (request.BusinessName != null) user.BusinessName = request.BusinessName;
            if (request.BusinessType != null) user.BusinessType = request.BusinessType;

            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return MapToDTO(user);
        }

        private static UserProfileDTO MapToDTO(Models.User user) => new()
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            Role = user.Role,
            Phone = user.Phone,
            Location = user.Location,
            Nin = user.NIN,
            District = user.District,
            Chiefdom = user.Chiefdom,
            Community = user.Community,
            FarmName = user.FarmName,
            FarmAddress = user.FarmAddress,
            FarmSize = user.FarmSize,
            FarmingExperience = user.FarmingExperience,
            PrimaryCrops = user.PrimaryCrops,
            FarmDescription = user.FarmDescription,
            BusinessName = user.BusinessName,
            BusinessType = user.BusinessType,
            TrustScore = user.TrustScore,
            VerificationStatus = user.VerificationStatus,
            Status = user.Status,
            IsEmailVerified = user.IsEmailVerified
        };
    }
}
