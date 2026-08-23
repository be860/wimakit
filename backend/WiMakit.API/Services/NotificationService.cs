using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using WiMakit.API.Data;
using WiMakit.API.DTOs;
using WiMakit.API.Hubs;
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
        private readonly IHubContext<ChatHub> _hub;

        public NotificationService(AppDbContext context, IHubContext<ChatHub> hub)
        {
            _context = context;
            _hub = hub;
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
                UserId = n.UserId,
                Type = n.Type,
                Title = n.Title,
                Body = n.Body,
                CreatedAt = n.CreatedAt,
                IsUnread = n.IsUnread
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

            var dto = new NotificationDTO
            {
                Id = notif.Id,
                UserId = notif.UserId,
                Type = notif.Type,
                Title = notif.Title,
                Body = notif.Body,
                CreatedAt = notif.CreatedAt,
                IsUnread = notif.IsUnread
            };

            // Push live so the bell/badge updates without a refresh — a specific
            // UserId goes to just that user's devices, null (broadcast) goes to
            // everyone currently connected.
            if (notif.UserId.HasValue)
            {
                await _hub.Clients.Group(ChatHub.UserGroup(notif.UserId.Value)).SendAsync("NewNotification", dto);
            }
            else
            {
                await _hub.Clients.All.SendAsync("NewNotification", dto);
            }

            return dto;
        }
    }
}
