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
        
        public MessagesController(IMessageService messageService)
        {
            _messageService = messageService;
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
    }
}
