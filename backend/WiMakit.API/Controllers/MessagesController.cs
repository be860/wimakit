using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WiMakit.API.Extensions;
using WiMakit.API.DTOs;
using WiMakit.API.Services;

namespace WiMakit.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MessagesController : ControllerBase
    {
        private readonly IMessageService _messageService;
        private readonly IFileStorageService _fileStorageService;
        private readonly IConfiguration _configuration;

        private static readonly string[] AttachmentImageExtensions = { ".jpg", ".jpeg", ".png", ".webp" };
        private static readonly string[] AttachmentAudioExtensions = { ".m4a", ".mp3", ".aac", ".wav", ".caf", ".3gp", ".webm", ".ogg" };

        public MessagesController(IMessageService messageService, IFileStorageService fileStorageService, IConfiguration configuration)
        {
            _messageService = messageService;
            _fileStorageService = fileStorageService;
            _configuration = configuration;
        }
        
        [Authorize(Policy = "VerifiedEmail")]
        [HttpGet("conversations")]
        public async Task<ActionResult<IEnumerable<ConversationDTO>>> GetConversations()
        {
            var userId = User.GetUserId();
            var conversations = await _messageService.GetConversationsAsync(userId);
            return Ok(conversations);
        }

        [Authorize(Policy = "VerifiedEmail")]
        [HttpGet("conversation/{otherUserId}")]
        public async Task<ActionResult<IEnumerable<MessageDTO>>> GetConversation(int otherUserId)
        {
            var userId = User.GetUserId();
            var messages = await _messageService.GetConversationAsync(userId, otherUserId);
            return Ok(messages);
        }

        [Authorize(Policy = "VerifiedEmail")]
        [HttpPost]
        public async Task<ActionResult<MessageDTO>> SendMessage(SendMessageRequest request)
        {
            var hasContent = !string.IsNullOrWhiteSpace(request.Content);
            var hasAttachment = !string.IsNullOrWhiteSpace(request.AttachmentUrl);
            if (!hasContent && !hasAttachment)
            {
                return BadRequest(new { message = "Message must include text or an attachment." });
            }

            var userId = User.GetUserId();
            var message = await _messageService.SendMessageAsync(userId, request);

            if (message == null)
            {
                return BadRequest(new { message = "Receiver not found" });
            }

            return CreatedAtAction(nameof(GetConversation), new { otherUserId = request.ReceiverId }, message);
        }

        [Authorize(Policy = "VerifiedEmail")]
        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var userId = User.GetUserId();
            var result = await _messageService.MarkAsReadAsync(id, userId);

            if (!result)
            {
                return NotFound(new { message = "Message not found or you don't have permission" });
            }

            return NoContent();
        }

        // Editing is text-only (see MessageService.EditMessageAsync) — voice/image
        // messages are deleted and resent rather than edited in place.
        [Authorize(Policy = "VerifiedEmail")]
        [HttpPut("{id}")]
        public async Task<ActionResult<MessageDTO>> EditMessage(int id, EditMessageRequest request)
        {
            var userId = User.GetUserId();
            var (message, error) = await _messageService.EditMessageAsync(id, userId, request.Content);

            if (message == null)
            {
                return BadRequest(new { message = error ?? "Could not edit this message." });
            }

            return Ok(message);
        }

        // Soft delete — the message row is kept (with its content cleared) so both
        // sides can still see a "This message was deleted" placeholder in the thread,
        // matching how WhatsApp shows a deleted message rather than removing all trace of it.
        [Authorize(Policy = "VerifiedEmail")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMessage(int id)
        {
            var userId = User.GetUserId();
            var success = await _messageService.DeleteMessageAsync(id, userId);

            if (!success)
            {
                return NotFound(new { message = "Message not found or you don't have permission to delete it." });
            }

            return NoContent();
        }

        // Shared by both the buyer and farmer chat UIs for voice notes and photo
        // attachments — unlike UploadController (farmer/admin, produce photos only),
        // this just requires a verified account and accepts either image or audio files.
        [Authorize(Policy = "VerifiedEmail")]
        [HttpPost("attachment")]
        public async Task<ActionResult<object>> UploadAttachment(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "No file uploaded." });
            }

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            var isImage = AttachmentImageExtensions.Contains(extension);
            var isAudio = AttachmentAudioExtensions.Contains(extension);

            if (!isImage && !isAudio)
            {
                return BadRequest(new { message = "Only JPG, PNG, WEBP images or M4A, MP3, AAC, WAV, WEBM, OGG voice recordings are allowed." });
            }

            // Voice notes run longer than a typical photo, so they get a bit more headroom.
            var maxSize = isAudio ? 15 * 1024 * 1024 : 5 * 1024 * 1024;
            if (file.Length > maxSize)
            {
                var limitLabel = isAudio ? "15MB" : "5MB";
                return BadRequest(new { message = $"File size exceeds the {limitLabel} limit." });
            }

            var bucket = _configuration["Supabase:ChatMediaBucket"] ?? "chat-media";
            var url = await _fileStorageService.UploadImageAsync(file, bucket);

            if (url == null)
            {
                return StatusCode(502, new { message = "Could not upload this file right now. Please try again shortly." });
            }

            return Ok(new { url, type = isAudio ? "voice" : "image" });
        }
    }
}
