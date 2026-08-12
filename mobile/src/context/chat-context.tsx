import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { messagesApi, ConversationDTO, MessageDTO } from '../services/messages-api';
import { useAuth } from './auth-context';

export interface ChatMessage {
  id: number;
  sender: 'buyer' | 'farmer';
  text: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  farmerId: number;
  farmerName: string;
  farmerLocation?: string | null;
  produceName?: string;
  produceId?: number | null;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  messages: ChatMessage[];
}

interface ChatContextType {
  conversations: Conversation[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  loadConversations: () => Promise<void>;
  loadThread: (farmerId: number) => Promise<Conversation | undefined>;
  sendMessage: (
    farmerId: number,
    text: string,
    farmerName?: string,
    produceName?: string,
    produceId?: number
  ) => Promise<void>;
  getConversation: (farmerId: number) => Conversation | undefined;
  markAsRead: (farmerId: number) => Promise<void>;
  totalUnread: number;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const POLL_INTERVAL_MS = 15000;

function formatTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (isToday) return time;
  if (isYesterday) return `Yesterday ${time}`;
  return date.toLocaleDateString([], { day: '2-digit', month: 'short' });
}

function mapConversation(dto: ConversationDTO): Conversation {
  return {
    id: `conv-${dto.userId}`,
    farmerId: dto.userId,
    farmerName: dto.userName,
    farmerLocation: dto.userLocation,
    produceName: dto.produceName || undefined,
    produceId: dto.produceId,
    lastMessage: dto.lastMessage,
    timestamp: formatTime(dto.lastMessageTime),
    unreadCount: dto.unreadCount,
    messages: [],
  };
}

function mapMessage(dto: MessageDTO, currentUserId: number | undefined): ChatMessage {
  return {
    id: dto.id,
    sender: dto.senderId === currentUserId ? 'buyer' : 'farmer',
    text: dto.content,
    timestamp: formatTime(dto.createdAt),
  };
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadConversations = useCallback(
    async (opts: { silent?: boolean } = {}) => {
      if (!token) return;
      if (!opts.silent) setLoading(true);
      else setRefreshing(true);
      try {
        const data = await messagesApi.getConversations();
        setConversations((prev) => {
          // Preserve any already-loaded message threads while refreshing summaries.
          const byId = new Map(prev.map((c) => [c.farmerId, c]));
          return data.map((dto) => {
            const mapped = mapConversation(dto);
            const existing = byId.get(dto.userId);
            return existing ? { ...mapped, messages: existing.messages } : mapped;
          });
        });
        setError(null);
      } catch (err: any) {
        if (!opts.silent) {
          setError(err?.data?.message || err?.message || 'Could not load messages.');
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token]
  );

  const loadThread = useCallback(
    async (farmerId: number): Promise<Conversation | undefined> => {
      try {
        const thread = await messagesApi.getConversation(farmerId);
        const messages = thread.map((m) => mapMessage(m, user?.id));

        let result: Conversation | undefined;
        setConversations((prev) => {
          const idx = prev.findIndex((c) => c.farmerId === farmerId);
          if (idx === -1) return prev;
          const last = thread[thread.length - 1];
          const next = [...prev];
          next[idx] = {
            ...next[idx],
            messages,
            lastMessage: last ? last.content : next[idx].lastMessage,
            timestamp: last ? formatTime(last.createdAt) : next[idx].timestamp,
          };
          result = next[idx];
          return next;
        });
        return result;
      } catch (err: any) {
        setError(err?.data?.message || err?.message || 'Could not load this conversation.');
        return undefined;
      }
    },
    [user?.id]
  );

  const sendMessage = useCallback(
    async (
      farmerId: number,
      text: string,
      farmerName = 'Farmer',
      produceName?: string,
      produceId?: number
    ) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const sent = await messagesApi.sendMessage({
        receiverId: farmerId,
        produceId,
        content: trimmed,
      });

      const newMessage = mapMessage(sent, user?.id);

      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.farmerId === farmerId);
        if (idx > -1) {
          const next = [...prev];
          const existing = next[idx];
          next[idx] = {
            ...existing,
            lastMessage: newMessage.text,
            timestamp: newMessage.timestamp,
            produceName: existing.produceName || produceName,
            messages: [...existing.messages, newMessage],
          };
          // Move most-recently-messaged conversation to the top.
          const [moved] = next.splice(idx, 1);
          return [moved, ...next];
        }

        const newConv: Conversation = {
          id: `conv-${farmerId}`,
          farmerId,
          farmerName,
          produceName,
          produceId,
          lastMessage: newMessage.text,
          timestamp: newMessage.timestamp,
          unreadCount: 0,
          messages: [newMessage],
        };
        return [newConv, ...prev];
      });
    },
    [user?.id]
  );

  const markAsRead = useCallback(
    async (farmerId: number) => {
      setConversations((prev) =>
        prev.map((c) => (c.farmerId === farmerId ? { ...c, unreadCount: 0 } : c))
      );

      try {
        const thread = await messagesApi.getConversation(farmerId);
        const toMark = thread.filter((m) => !m.isRead && m.receiverId === user?.id);
        await Promise.all(toMark.map((m) => messagesApi.markAsRead(m.id).catch(() => {})));
      } catch {
        // Best-effort — conversation summary already reflects unread=0 locally.
      }
    },
    [user?.id]
  );

  const getConversation = useCallback(
    (farmerId: number) => conversations.find((c) => c.farmerId === farmerId),
    [conversations]
  );

  // Initial load + background polling for new messages while signed in.
  useEffect(() => {
    if (!token) {
      setConversations([]);
      return;
    }

    loadConversations();

    const startPolling = () => {
      if (pollRef.current) return;
      pollRef.current = setInterval(() => loadConversations({ silent: true }), POLL_INTERVAL_MS);
    };
    const stopPolling = () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };

    startPolling();

    const onAppStateChange = (state: AppStateStatus) => {
      if (state === 'active') {
        loadConversations({ silent: true });
        startPolling();
      } else {
        stopPolling();
      }
    };
    const sub = AppState.addEventListener('change', onAppStateChange);

    return () => {
      stopPolling();
      sub.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const totalUnread = useMemo(
    () => conversations.reduce((sum, c) => sum + c.unreadCount, 0),
    [conversations]
  );

  return (
    <ChatContext.Provider
      value={{
        conversations,
        loading,
        refreshing,
        error,
        loadConversations: () => loadConversations(),
        loadThread,
        sendMessage,
        getConversation,
        markAsRead,
        totalUnread,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within a ChatProvider');
  return ctx;
}
