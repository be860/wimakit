using Microsoft.EntityFrameworkCore;
using WiMakit.API.Data;
using WiMakit.API.DTOs;
using WiMakit.API.Models;

namespace WiMakit.API.Services
{
    public interface INotificationService
    {
        Task<IEnumerable<NotificationDTO>> GetUserNotificationsAsync(int userId);
        Task<bool> MarkAsReadAsync(int notificationId, int userId);
        Task<NotificationDTO> CreateNotificationAsync(CreateNotificationRequest request);
    }

    public class NotificationService : INotificationService
    {
        private readonly AppDbContext _context;

        public NotificationService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<NotificationDTO>> GetUserNotificationsAsync(int userId)
        {
            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId || n.UserId == null)
                .OrderByDescending(n => n.CreatedAt)
                .Take(50)
                .ToListAsync();

            return notifications.Select(n => new NotificationDTO
            {
                Id = n.Id,
                Type = n.Type,
                Title = n.Title,
                Body = n.Body,
                At = n.CreatedAt,
                Unread = n.IsUnread
            });
        }

        public async Task<bool> MarkAsReadAsync(int notificationId, int userId)
        {
            var notif = await _context.Notifications.FirstOrDefaultAsync(n => n.Id == notificationId && (n.UserId == userId || n.UserId == null));
            if (notif == null) return false;

            notif.IsUnread = false;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<NotificationDTO> CreateNotificationAsync(CreateNotificationRequest request)
        {
            var notif = new Notification
            {
                UserId = request.UserId,
                Type = request.Type,
                Title = request.Title,
                Body = request.Body,
                IsUnread = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Notifications.Add(notif);
            await _context.SaveChangesAsync();

            return new NotificationDTO
            {
                Id = notif.Id,
                Type = notif.Type,
                Title = notif.Title,
                Body = notif.Body,
                At = notif.CreatedAt,
                Unread = notif.IsUnread
            };
        }
    }
}
