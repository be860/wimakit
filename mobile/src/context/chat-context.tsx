import React, { createContext, useContext, useState, useCallback } from 'react';
import { apiClient } from '../services/api-client';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MessageDTO {
  id: number;
  senderId: number;
  senderName: string;
  receiverId: number;
  receiverName: string;
  produceId?: number;
  produceName?: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface ConversationDTO {
  userId: number;
  userName: string;
  userLocation?: string;
  userRole: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  produceId?: number;
  produceName?: string;
}

interface ChatContextType {
  /** Total unread count across all conversations (refreshed on load) */
  totalUnread: number;

  /**
   * Send a message to a farmer from produce details modal.
   * Uses POST /api/messages.
   */
  sendMessage: (
    receiverId: number,
    content: string,
    farmerName?: string,
    produceName?: string,
    produceId?: number
  ) => Promise<void>;

  /** Refresh total unread count from the backend */
  refreshUnread: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [totalUnread, setTotalUnread] = useState(0);

  const refreshUnread = useCallback(async () => {
    try {
      const conversations = await apiClient.get<ConversationDTO[]>('/api/messages/conversations');
      const total = conversations.reduce((sum, c) => sum + c.unreadCount, 0);
      setTotalUnread(total);
    } catch {
      // Silently ignore — could be called before auth
    }
  }, []);

  const sendMessage = useCallback(
    async (
      receiverId: number,
      content: string,
      _farmerName?: string,
      _produceName?: string,
      produceId?: number
    ) => {
      await apiClient.post<MessageDTO>('/api/messages', {
        receiverId,
        content,
        produceId: produceId ?? undefined,
      });
    },
    []
  );

  return (
    <ChatContext.Provider value={{ totalUnread, sendMessage, refreshUnread }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within a ChatProvider');
  return ctx;
}
