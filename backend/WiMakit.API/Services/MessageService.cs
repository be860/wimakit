using WiMakit.API.Data;
using WiMakit.API.DTOs;
using WiMakit.API.Hubs;
using WiMakit.API.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace WiMakit.API.Services
{
    public class MessageService : IMessageService
    {
        private readonly AppDbContext _context;
        private readonly IHubContext<ChatHub> _hub;

        public MessageService(AppDbContext context, IHubContext<ChatHub> hub)
        {
            _context = context;
            _hub = hub;
        }

        // Pushes to both participants' groups so every open device/tab for
        // either person stays in sync, not just the one on the other end.
        private Task PushToConversationAsync(int userIdA, int userIdB, string eventName, object payload)
        {
            var groups = userIdA == userIdB
                ? new[] { ChatHub.UserGroup(userIdA) }
                : new[] { ChatHub.UserGroup(userIdA), ChatHub.UserGroup(userIdB) };

            return _hub.Clients.Groups(groups).SendAsync(eventName, payload);
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
                    UserName = g.First().SenderId == userId ? g.First().Receiver!.FullName : g.First().Sender!.FullName,
                    UserProfilePhotoUrl = g.First().SenderId == userId ? g.First().Receiver?.ProfilePhotoUrl : g.First().Sender?.ProfilePhotoUrl,
                    UserLocation = g.First().SenderId == userId ? g.First().Receiver?.Location : g.First().Sender?.Location,
                    UserRole = g.First().SenderId == userId ? g.First().Receiver!.Role : g.First().Sender!.Role,
                    LastMessage = DescribeLastMessage(g.First()),
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

                await PushToConversationAsync(userId, otherUserId, "MessagesRead", new
                {
                    messageIds = unread.Select(m => m.Id).ToArray(),
                    readerId = userId,
                    otherUserId
                });
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
                Content = request.Content ?? string.Empty,
                MessageType = string.IsNullOrWhiteSpace(request.MessageType) ? "text" : request.MessageType,
                AttachmentUrl = request.AttachmentUrl,
                AttachmentDurationSeconds = request.AttachmentDurationSeconds,
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

            var dto = MapMessageToDTO(message);
            await PushToConversationAsync(message.SenderId, message.ReceiverId, "ReceiveMessage", dto);
            return dto;
        }

        public async Task<bool> MarkAsReadAsync(int messageId, int userId)
        {
            var message = await _context.Messages.FindAsync(messageId);
            if (message == null || message.ReceiverId != userId) return false;

            if (!message.IsRead)
            {
                message.IsRead = true;
                await _context.SaveChangesAsync();

                await PushToConversationAsync(message.SenderId, message.ReceiverId, "MessagesRead", new
                {
                    messageIds = new[] { message.Id },
                    readerId = userId,
                    otherUserId = message.SenderId
                });
            }
            return true;
        }

        public async Task<(MessageDTO? Message, string? Error)> EditMessageAsync(int messageId, int userId, string newContent)
        {
            var message = await _context.Messages
                .Include(m => m.Sender)
                .Include(m => m.Receiver)
                .Include(m => m.Produce)
                .FirstOrDefaultAsync(m => m.Id == messageId);

            if (message == null) return (null, "Message not found.");
            if (message.SenderId != userId) return (null, "You can only edit your own messages.");
            if (message.IsDeleted) return (null, "Cannot edit a deleted message.");
            if (message.MessageType != "text") return (null, "Only text messages can be edited.");

            message.Content = newContent;
            message.IsEdited = true;
            message.EditedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var dto = MapMessageToDTO(message);
            await PushToConversationAsync(message.SenderId, message.ReceiverId, "MessageEdited", dto);
            return (dto, null);
        }

        public async Task<bool> DeleteMessageAsync(int messageId, int userId)
        {
            var message = await _context.Messages
                .Include(m => m.Sender)
                .Include(m => m.Receiver)
                .Include(m => m.Produce)
                .FirstOrDefaultAsync(m => m.Id == messageId);

            if (message == null || message.SenderId != userId) return false;
            if (message.IsDeleted) return true;

            message.IsDeleted = true;
            message.DeletedAt = DateTime.UtcNow;
            // Clear the stored payload too, not just hide it behind IsDeleted —
            // once deleted it shouldn't still be sitting in the database in the clear.
            message.Content = string.Empty;
            message.AttachmentUrl = null;
            await _context.SaveChangesAsync();

            await PushToConversationAsync(message.SenderId, message.ReceiverId, "MessageDeleted", MapMessageToDTO(message));
            return true;
        }

        private static MessageDTO MapMessageToDTO(Message message)
        {
            return new MessageDTO
            {
                Id = message.Id,
                SenderId = message.SenderId,
                SenderName = message.Sender?.FullName ?? "",
                SenderProfilePhotoUrl = message.Sender?.ProfilePhotoUrl,
                ReceiverId = message.ReceiverId,
                ReceiverName = message.Receiver?.FullName ?? "",
                ProduceId = message.ProduceId,
                ProduceName = message.Produce?.Name,
                Content = message.Content,
                MessageType = message.MessageType,
                AttachmentUrl = message.AttachmentUrl,
                AttachmentDurationSeconds = message.AttachmentDurationSeconds,
                IsEdited = message.IsEdited,
                IsDeleted = message.IsDeleted,
                IsRead = message.IsRead,
                CreatedAt = message.CreatedAt
            };
        }

        // Friendly preview text for the conversation list — the message thread itself
        // sends raw MessageDTO fields and lets the client decide how to render them.
        private static string DescribeLastMessage(Message message)
        {
            if (message.IsDeleted) return "This message was deleted";
            return message.MessageType switch
            {
                "voice" => "🎤 Voice message",
                "image" => "📷 Photo",
                _ => message.Content
            };
        }
    }
}
