using WiMakit.API.DTOs;
using WiMakit.API.Models;

namespace WiMakit.API.Services
{
    public interface IMessageService
    {
        Task<IEnumerable<ConversationDTO>> GetConversationsAsync(int userId);
        Task<IEnumerable<MessageDTO>> GetConversationAsync(int userId, int otherUserId);
        Task<MessageDTO?> SendMessageAsync(int senderId, SendMessageRequest request);
        Task<bool> MarkAsReadAsync(int messageId, int userId);
    }
}
