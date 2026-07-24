using System.ComponentModel.DataAnnotations;

namespace WiMakit.API.DTOs
{
    public class SendMessageRequest
    {
        [Required]
        public int ReceiverId { get; set; }
        
        public int? ProduceId { get; set; }
        
        [Required]
        public string Content { get; set; } = string.Empty;
    }
    
    public class MessageDTO
    {
        public int Id { get; set; }
        public int SenderId { get; set; }
        public string SenderName { get; set; } = string.Empty;
        public int ReceiverId { get; set; }
        public string ReceiverName { get; set; } = string.Empty;
        public int? ProduceId { get; set; }
        public string? ProduceName { get; set; }
        public string Content { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
    }
    
    public class ConversationDTO
    {
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string? UserLocation { get; set; }
        public string UserRole { get; set; } = string.Empty;
        public string LastMessage { get; set; } = string.Empty;
        public DateTime LastMessageTime { get; set; }
        public int UnreadCount { get; set; }
        public int? ProduceId { get; set; }
        public string? ProduceName { get; set; }
    }
}
