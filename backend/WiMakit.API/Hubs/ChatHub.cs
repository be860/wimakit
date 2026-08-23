using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using WiMakit.API.Extensions;

namespace WiMakit.API.Hubs
{
    // Realtime companion to MessagesController — the REST endpoints still own
    // validation, persistence and file uploads; this hub only fans the result
    // back out to both participants' connected devices. Event contract (kept in
    // sync with MessageService's broadcasts and the mobile app's listeners):
    //   "ReceiveMessage" -> MessageDTO   (new message)
    //   "MessageEdited"  -> MessageDTO   (text edit)
    //   "MessageDeleted" -> MessageDTO   (soft-deleted, content already cleared)
    //   "MessagesRead"   -> { messageIds, readerId, otherUserId }
    [Authorize(Policy = "VerifiedEmail")]
    public class ChatHub : Hub
    {
        // One group per user id so a push reaches every device/tab that user has open.
        public static string UserGroup(int userId) => $"user-{userId}";

        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.GetUserId() ?? 0;
            if (userId > 0)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, UserGroup(userId));
            }
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.User?.GetUserId() ?? 0;
            if (userId > 0)
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, UserGroup(userId));
            }
            await base.OnDisconnectedAsync(exception);
        }
    }
}
