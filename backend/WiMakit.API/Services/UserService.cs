using Microsoft.EntityFrameworkCore;
using WiMakit.API.Data;
using WiMakit.API.DTOs;

namespace WiMakit.API.Services
{
    public interface IUserService
    {
        Task<UserProfileDTO?> GetProfileAsync(int userId);
        Task<UserProfileDTO?> UpdateProfileAsync(int userId, UpdateUserProfileRequest request);
        Task<UserProfileDTO?> SetProfilePhotoAsync(int userId, string photoUrl);
         Task<UserProfileDTO?> UpdateProfilePhotoAsync(int userId, string photoUrl);
        Task<UserProfileDTO?> UpdateFarmPhotoAsync(int userId, string photoUrl);
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
            if (request.NotifyNewOrders.HasValue) user.NotifyNewOrders = request.NotifyNewOrders.Value;
            if (request.NotifyListingApprovals.HasValue) user.NotifyListingApprovals = request.NotifyListingApprovals.Value;
            if (request.NotifyMessages.HasValue) user.NotifyMessages = request.NotifyMessages.Value;
            if (request.NotifyBroadcasts.HasValue) user.NotifyBroadcasts = request.NotifyBroadcasts.Value;

            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return MapToDTO(user);
        }

        public async Task<UserProfileDTO?> SetProfilePhotoAsync(int userId, string photoUrl)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) return null;

            user.ProfilePhotoUrl = photoUrl;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return MapToDTO(user);
        }

        public async Task<UserProfileDTO?> UpdateProfilePhotoAsync(int userId, string photoUrl)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) return null;

            user.ProfilePhotoUrl = photoUrl;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return MapToDTO(user);
        }

        public async Task<UserProfileDTO?> UpdateFarmPhotoAsync(int userId, string photoUrl)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) return null;

            user.FarmPhotoUrl = photoUrl;
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
            ProfilePhotoUrl = user.ProfilePhotoUrl,
            Phone = user.Phone,
            Location = user.Location,
            Nin = user.NIN,
            District = user.District,
            Chiefdom = user.Chiefdom,
            Community = user.Community,
            IdDocumentType = user.IdDocumentType,
            IdDocumentFrontUrl = user.IdDocumentFrontUrl,
            IdDocumentBackUrl = user.IdDocumentBackUrl,
            FarmPhotoUrl = user.FarmPhotoUrl,
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
            IsEmailVerified = user.IsEmailVerified,
            NotifyNewOrders = user.NotifyNewOrders,
            NotifyListingApprovals = user.NotifyListingApprovals,
            NotifyMessages = user.NotifyMessages,
            NotifyBroadcasts = user.NotifyBroadcasts,
            CreatedAt = user.CreatedAt
        };
    }
}
