import { apiClient } from './api-client';

// Mirrors backend/WiMakit.API/DTOs/MessageDTOs.cs

export interface MessageDTO {
  id: number;
  senderId: number;
  senderName: string;
  receiverId: number;
  receiverName: string;
  produceId?: number | null;
  produceName?: string | null;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface ConversationDTO {
  userId: number;
  userName: string;
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
  content: string;
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
};
