using WiMakit.API.Data;
using WiMakit.API.DTOs;
using WiMakit.API.Models;
using Microsoft.EntityFrameworkCore;

namespace WiMakit.API.Services
{
    public class MessageService : IMessageService
    {
        private readonly AppDbContext _context;

        public MessageService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ConversationDTO>> GetConversationsAsync(int userId)
        {
            // Get all conversations for the user
            var messages = await _context.Messages
                .Where(m => m.SenderId == userId || m.ReceiverId == userId)
                .Include(m => m.Sender)
                .Include(m => m.Receiver)
                .Include(m => m.Produce)
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();

            // Group by the other user in the conversation
            return messages
                .GroupBy(m => m.SenderId == userId ? m.ReceiverId : m.SenderId)
                .Select(g => new ConversationDTO
                {
                    UserId = g.Key,
                    UserName = g.First().SenderId == userId ? g.First().Receiver!.Name : g.First().Sender!.Name,
                    UserLocation = g.First().SenderId == userId ? g.First().Receiver?.Location : g.First().Sender?.Location,
                    UserRole = g.First().SenderId == userId ? g.First().Receiver!.Role : g.First().Sender!.Role,
                    LastMessage = g.First().Content,
                    LastMessageTime = g.First().CreatedAt,
                    UnreadCount = g.Count(m => m.ReceiverId == userId && !m.IsRead),
                    ProduceId = g.First().ProduceId,
                    ProduceName = g.First().Produce?.Name
                })
                .OrderByDescending(c => c.LastMessageTime)
                .ToList();
        }

        public async Task<IEnumerable<MessageDTO>> GetConversationAsync(int userId, int otherUserId)
        {
            var messages = await _context.Messages
                .Where(m => (m.SenderId == userId && m.ReceiverId == otherUserId) ||
                           (m.SenderId == otherUserId && m.ReceiverId == userId))
                .Include(m => m.Sender)
                .Include(m => m.Receiver)
                .Include(m => m.Produce)
                .OrderBy(m => m.CreatedAt)
                .ToListAsync();

            // Mark unread messages from the other user as read
            var unread = messages.Where(m => m.ReceiverId == userId && !m.IsRead).ToList();
            if (unread.Any())
            {
                foreach (var msg in unread)
                {
                    msg.IsRead = true;
                }
                await _context.SaveChangesAsync();
            }

            return messages.Select(m => MapMessageToDTO(m)).ToList();
        }

        public async Task<MessageDTO?> SendMessageAsync(int senderId, SendMessageRequest request)
        {
            var receiver = await _context.Users.FindAsync(request.ReceiverId);
            if (receiver == null) return null;

            var message = new Message
            {
                SenderId = senderId,
                ReceiverId = request.ReceiverId,
                ProduceId = request.ProduceId,
                Content = request.Content,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            // Load related entities for DTO mapping
            await _context.Entry(message).Reference(m => m.Sender).LoadAsync();
            await _context.Entry(message).Reference(m => m.Receiver).LoadAsync();
            if (message.ProduceId.HasValue)
            {
                await _context.Entry(message).Reference(m => m.Produce).LoadAsync();
            }

            return MapMessageToDTO(message);
        }

        public async Task<bool> MarkAsReadAsync(int messageId, int userId)
        {
            var message = await _context.Messages.FindAsync(messageId);
            if (message == null || message.ReceiverId != userId) return false;

            if (!message.IsRead)
            {
                message.IsRead = true;
                await _context.SaveChangesAsync();
            }
            return true;
        }

        private static MessageDTO MapMessageToDTO(Message message)
        {
            return new MessageDTO
            {
                Id = message.Id,
                SenderId = message.SenderId,
                SenderName = message.Sender?.Name ?? "",
                ReceiverId = message.ReceiverId,
                ReceiverName = message.Receiver?.Name ?? "",
                ProduceId = message.ProduceId,
                ProduceName = message.Produce?.Name,
                Content = message.Content,
                IsRead = message.IsRead,
                CreatedAt = message.CreatedAt
            };
        }
    }
}
