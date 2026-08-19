using System.ComponentModel.DataAnnotations;

namespace WiMakit.API.DTOs
{
    public class SendMessageRequest
    {
        [Required(ErrorMessage = "Receiver ID is required.")]
        [Range(1, int.MaxValue, ErrorMessage = "Receiver ID must be a positive integer.")]
        public int ReceiverId { get; set; }

        public int? ProduceId { get; set; }

        // Required for text messages. Optional for voice/image messages, where
        // AttachmentUrl carries the payload instead — MessagesController enforces
        // that at least one of Content/AttachmentUrl is present.
        [MaxLength(2000, ErrorMessage = "Message cannot exceed 2000 characters.")]
        public string? Content { get; set; }

        // "text" | "voice" | "image"
        public string MessageType { get; set; } = "text";

        public string? AttachmentUrl { get; set; }

        public int? AttachmentDurationSeconds { get; set; }
    }

    public class EditMessageRequest
    {
        [Required(ErrorMessage = "Message content is required.")]
        [MinLength(1, ErrorMessage = "Message cannot be empty.")]
        [MaxLength(2000, ErrorMessage = "Message cannot exceed 2000 characters.")]
        public string Content { get; set; } = string.Empty;
    }

    public class MessageDTO
    {
        public int Id { get; set; }
        public int SenderId { get; set; }
        public string SenderName { get; set; } = string.Empty;
        public string? SenderProfilePhotoUrl { get; set; }
        public int ReceiverId { get; set; }
        public string ReceiverName { get; set; } = string.Empty;
        public int? ProduceId { get; set; }
        public string? ProduceName { get; set; }
        public string Content { get; set; } = string.Empty;
        public string MessageType { get; set; } = "text";
        public string? AttachmentUrl { get; set; }
        public int? AttachmentDurationSeconds { get; set; }
        public bool IsEdited { get; set; }
        public bool IsDeleted { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class ConversationDTO
    {
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string? UserProfilePhotoUrl { get; set; }
        public string? UserLocation { get; set; }
        public string UserRole { get; set; } = string.Empty;
        public string LastMessage { get; set; } = string.Empty;
        public DateTime LastMessageTime { get; set; }
        public int UnreadCount { get; set; }
        public int? ProduceId { get; set; }
        public string? ProduceName { get; set; }
    }
}
