import { apiClient } from './api-client';

// Mirrors backend/WiMakit.API/DTOs/MessageDTOs.cs

export type MessageType = 'text' | 'voice' | 'image';

export interface MessageDTO {
  id: number;
  senderId: number;
  senderName: string;
  senderProfilePhotoUrl?: string | null;
  receiverId: number;
  receiverName: string;
  produceId?: number | null;
  produceName?: string | null;
  content: string;
  messageType: MessageType;
  attachmentUrl?: string | null;
  attachmentDurationSeconds?: number | null;
  isEdited: boolean;
  isDeleted: boolean;
  isRead: boolean;
  createdAt: string;
}

export interface ConversationDTO {
  userId: number;
  userName: string;
  userProfilePhotoUrl?: string | null;
  userLocation?: string | null;
  userRole: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  produceId?: number | null;
  produceName?: string | null;
}

export interface SendMessageRequest {
  receiverId: number;
  produceId?: number;
  // Required for text messages. Optional for voice/image messages, where
  // attachmentUrl carries the payload instead — the backend rejects a request
  // with neither content nor attachmentUrl present.
  content?: string;
  messageType?: MessageType;
  attachmentUrl?: string;
  attachmentDurationSeconds?: number;
}

export interface UploadAttachmentResponse {
  url: string;
  type: 'image' | 'voice';
}

export const messagesApi = {
  // GET /api/messages/conversations — one row per person this user has messaged with.
  getConversations: () => apiClient.get<ConversationDTO[]>('/api/messages/conversations'),

  // GET /api/messages/conversation/{otherUserId} — full message thread with one person.
  getConversation: (otherUserId: number) =>
    apiClient.get<MessageDTO[]>(`/api/messages/conversation/${otherUserId}`),

  // POST /api/messages — send a new message, optionally tied to a produce listing.
  sendMessage: (request: SendMessageRequest) =>
    apiClient.post<MessageDTO>('/api/messages', request),

  // PUT /api/messages/{id}/read — mark a single message as read.
  markAsRead: (messageId: number) => apiClient.put<void>(`/api/messages/${messageId}/read`),

  // PUT /api/messages/{id} — text-only edit of one of the caller's own messages.
  editMessage: (messageId: number, content: string) =>
    apiClient.put<MessageDTO>(`/api/messages/${messageId}`, { content }),

  // DELETE /api/messages/{id} — soft-deletes one of the caller's own messages.
  deleteMessage: (messageId: number) => apiClient.delete<void>(`/api/messages/${messageId}`),

  // POST /api/messages/attachment — multipart upload (field name "file") for
  // voice notes and photo attachments. Returns the hosted URL plus the
  // inferred attachment type.
  uploadAttachment: (formData: FormData) =>
    apiClient.post<UploadAttachmentResponse>('/api/messages/attachment', formData),
};
