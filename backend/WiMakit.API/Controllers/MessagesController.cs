using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using WiMakit.API.Data;
using WiMakit.API.DTOs;
using WiMakit.API.Models;
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

        [Authorize]
        [HttpGet("conversations")]
        public async Task<ActionResult<IEnumerable<ConversationDTO>>> GetConversations()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var conversations = await _messageService.GetConversationsAsync(userId);
            return Ok(conversations);
        }

        [Authorize]
        
        [HttpGet("conversation/{otherUserId}")]
        public async Task<ActionResult<IEnumerable<MessageDTO>>> GetConversation(int otherUserId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var messages = await _messageService.GetConversationAsync(userId, otherUserId);
            return Ok(messages);
        }

        [Authorize]
        [HttpPost]
        public async Task<ActionResult<MessageDTO>> SendMessage(SendMessageRequest request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var message = await _messageService.SendMessageAsync(userId, request);
            
            if (message == null)
            {
                return BadRequest(new { message = "Receiver not found" });
            }
            
            return CreatedAtAction(nameof(GetConversation), new { otherUserId = request.ReceiverId }, message);
        }

        [Authorize]
        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var result = await _messageService.MarkAsReadAsync(id, userId);
            
            if (!result)
            {
                return NotFound(new { message = "Message not found or you don't have permission" });
            }
            
            return NoContent();
        }
    }
}
