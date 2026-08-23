import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { apiClient, API_BASE_URL, TOKEN_KEY } from '../services/api-client';
import { getStorageItem } from '../services/storage';
import { useAuth } from './auth-context';
import type { MessageDTO as ServerMessageDTO, ConversationDTO as ServerConversationDTO } from '../services/messages-api';
import type { Order } from '../services/orders-api';
import type { NotificationItem } from '../services/notifications-api';

// ─── Types ───────────────────────────────────────────────────────────────────

/**
 * Events pushed by ChatHub (see backend Hubs/ChatHub.cs). Despite the name,
 * the hub is a general per-user push channel now, not just chat — it also
 * carries order and notification updates so the app never needs a manual
 * refresh to see something that changed server-side.
 */
export type ChatRealtimeEvent =
  | { type: 'received'; message: ServerMessageDTO }
  | { type: 'edited'; message: ServerMessageDTO }
  | { type: 'deleted'; message: ServerMessageDTO }
  | { type: 'read'; messageIds: number[]; readerId: number; otherUserId: number }
  | { type: 'orderCreated'; order: Order }
  | { type: 'orderStatusChanged'; order: Order }
  | { type: 'notification'; notification: NotificationItem };

type ChatEventListener = (event: ChatRealtimeEvent) => void;

interface ChatContextType {
  /** Total unread count across all conversations (refreshed on load and on realtime events) */
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

  /**
   * Subscribe to realtime message events pushed over the SignalR chat hub.
   * Returns an unsubscribe function. Screens (e.g. the messages tab) use this
   * to update an open conversation live instead of polling.
   */
  subscribeToRealtime: (listener: ChatEventListener) => () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuth();
  const [totalUnread, setTotalUnread] = useState(0);
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const listenersRef = useRef<Set<ChatEventListener>>(new Set());

  const refreshUnread = useCallback(async () => {
    try {
      const conversations = await apiClient.get<ServerConversationDTO[]>('/api/messages/conversations');
      const total = conversations.reduce((sum, c) => sum + c.unreadCount, 0);
      setTotalUnread(total);
    } catch {
      // Silently ignore — could be called before auth
    }
  }, []);

  const subscribeToRealtime = useCallback((listener: ChatEventListener) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  // Open one SignalR connection per signed-in session and keep it alive for the
  // lifetime of that session — screens subscribe/unsubscribe to it rather than
  // each owning a connection, so switching tabs doesn't drop the socket.
  useEffect(() => {
    if (!token || !user) {
      connectionRef.current?.stop().catch(() => {});
      connectionRef.current = null;
      return;
    }

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}/hubs/chat`, {
        accessTokenFactory: async () => (await getStorageItem(TOKEN_KEY)) ?? '',
        transport: signalR.HttpTransportType.WebSockets,
        skipNegotiation: true,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    const emit = (event: ChatRealtimeEvent) => {
      listenersRef.current.forEach((listener) => listener(event));
    };

    connection.on('ReceiveMessage', (message: ServerMessageDTO) => {
      emit({ type: 'received', message });
      if (message.receiverId === user.id) refreshUnread();
    });
    connection.on('MessageEdited', (message: ServerMessageDTO) => {
      emit({ type: 'edited', message });
    });
    connection.on('MessageDeleted', (message: ServerMessageDTO) => {
      emit({ type: 'deleted', message });
    });
    connection.on(
      'MessagesRead',
      (payload: { messageIds: number[]; readerId: number; otherUserId: number }) => {
        emit({ type: 'read', ...payload });
        refreshUnread();
      }
    );
    connection.on('OrderCreated', (order: Order) => emit({ type: 'orderCreated', order }));
    connection.on('OrderStatusChanged', (order: Order) => emit({ type: 'orderStatusChanged', order }));
    connection.on('NewNotification', (notification: NotificationItem) =>
      emit({ type: 'notification', notification })
    );

    connection.start().catch(() => {
      // Realtime is best-effort — the REST endpoints still work standalone, so a
      // failed/offline socket just falls back to manual refresh.
    });

    connectionRef.current = connection;

    return () => {
      connection.stop().catch(() => {});
      connectionRef.current = null;
    };
    // Deliberately depend on user?.id, not `user` — auth-context hands back a
    // new user object on every profile refresh, which would otherwise tear
    // down and reopen the socket far more often than the identity actually changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?.id, refreshUnread]);

  const sendMessage = useCallback(
    async (
      receiverId: number,
      content: string,
      _farmerName?: string,
      _produceName?: string,
      produceId?: number
    ) => {
      await apiClient.post<ServerMessageDTO>('/api/messages', {
        receiverId,
        content,
        produceId: produceId ?? undefined,
      });
    },
    []
  );

  return (
    <ChatContext.Provider value={{ totalUnread, sendMessage, refreshUnread, subscribeToRealtime }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within a ChatProvider');
  return ctx;
}
