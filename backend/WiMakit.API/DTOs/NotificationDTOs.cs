namespace WiMakit.API.DTOs
{
    public class NotificationDTO
    {
        public int Id { get; set; }
        public string Type { get; set; } = string.Empty; // "order", "product", "message", "broadcast"
        public string Title { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public DateTime At { get; set; }
        public bool Unread { get; set; }
    }

    public class CreateNotificationRequest
    {
        public int? UserId { get; set; }
        public string Type { get; set; } = "broadcast";
        public string Title { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
    }
}
