import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { COLORS, FONTS, RADIUS } from '../../constants/theme';
import { apiClient, getErrorMessage } from '../../services/api-client';

// ────────────────────────────────────────────────────────────────
// Types mirroring backend DTOs
// ────────────────────────────────────────────────────────────────

interface ConversationDTO {
  userId: number;
  userName: string;
  userLocation?: string;
  userRole: string;
  lastMessage: string;
  lastMessageTime: string; // ISO datetime
  unreadCount: number;
  produceId?: number;
  produceName?: string;
}

interface MessageDTO {
  id: number;
  senderId: number;
  senderName: string;
  receiverId: number;
  receiverName: string;
  produceId?: number;
  produceName?: string;
  content: string;
  isRead: boolean;
  createdAt: string; // ISO datetime
}

// ────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60_000) return 'Just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

// ────────────────────────────────────────────────────────────────
// Screen
// ────────────────────────────────────────────────────────────────

export default function MessagesScreen() {
  const [conversations, setConversations] = useState<ConversationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active chat state
  const [activeConv, setActiveConv] = useState<ConversationDTO | null>(null);
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // Current user's id — inferred from first message received
  const [myUserId, setMyUserId] = useState<number | null>(null);

  const loadConversations = useCallback(async () => {
    setErrorMsg(null);
    try {
      const data = await apiClient.get<ConversationDTO[]>('/api/messages/conversations');
      setConversations(data);
    } catch (err: any) {
      const msg = getErrorMessage(err, 'Could not load conversations.');
      setErrorMsg(msg);
      Toast.show({ type: 'error', text1: 'Could not load conversations', text2: msg });
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadConversations().finally(() => setLoading(false));
  }, [loadConversations]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  const openConversation = async (conv: ConversationDTO) => {
    setActiveConv(conv);
    setChatLoading(true);
    setMessages([]);

    try {
      const data = await apiClient.get<MessageDTO[]>(
        `/api/messages/conversation/${conv.userId}`
      );
      setMessages(data);

      // Determine my user ID from the first message where sender ≠ conv.userId
      if (data.length > 0 && myUserId === null) {
        const fromMe = data.find((m) => m.senderId !== conv.userId);
        if (fromMe) setMyUserId(fromMe.senderId);
      }

      // Mark unread messages as read
      const unread = data.filter((m) => !m.isRead && m.senderId === conv.userId);
      for (const msg of unread) {
        apiClient.put(`/api/messages/${msg.id}/read`, {}).catch(() => {});
      }

      // Clear unread badge locally
      setConversations((prev) =>
        prev.map((c) => (c.userId === conv.userId ? { ...c, unreadCount: 0 } : c))
      );
    } catch (err: any) {
      setMessages([]);
      Toast.show({
        type: 'error',
        text1: 'Could not load this conversation',
        text2: getErrorMessage(err, 'Please try again.'),
      });
    } finally {
      setChatLoading(false);
    }

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 200);
  };

  const handleSend = async () => {
    if (!activeConv || !inputText.trim() || sending) return;

    const text = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const sent = await apiClient.post<MessageDTO>('/api/messages', {
        receiverId: activeConv.userId,
        content: text,
        produceId: activeConv.produceId ?? undefined,
      });

      setMessages((prev) => [...prev, sent]);
      setMyUserId(sent.senderId);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

      // Update conversation preview
      setConversations((prev) =>
        prev.map((c) =>
          c.userId === activeConv.userId
            ? { ...c, lastMessage: text, lastMessageTime: sent.createdAt }
            : c
        )
      );
    } catch (err) {
      // Put text back if send fails
      setInputText(text);
      Toast.show({
        type: 'error',
        text1: 'Message not sent',
        text2: getErrorMessage(err, 'Please try again.'),
      });
    } finally {
      setSending(false);
    }
  };

  // ─── Render conversation list item ───
  const renderConvItem = ({ item }: { item: ConversationDTO }) => (
    <TouchableOpacity
      style={styles.convCard}
      activeOpacity={0.8}
      onPress={() => openConversation(item)}
    >
      <View style={styles.farmerAvatar}>
        <Text style={styles.avatarInitial}>
          {(item.userName || 'F')[0].toUpperCase()}
        </Text>
      </View>

      <View style={styles.convBody}>
        <View style={styles.convHeaderRow}>
          <Text style={styles.farmerName} numberOfLines={1}>
            {item.userName}
          </Text>
          <Text style={styles.timeText}>{formatTime(item.lastMessageTime)}</Text>
        </View>
        {item.produceName && (
          <Text style={styles.produceTag} numberOfLines={1}>
            Re: {item.produceName}
          </Text>
        )}
        <Text style={styles.lastMsg} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>

      {item.unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{item.unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <Text style={styles.subtitle}>Direct chat with verified farmers</Text>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator color={COLORS.primary} size="large" />
        </View>
      ) : errorMsg ? (
        <View style={styles.centerBox}>
          <Ionicons name="alert-circle-outline" size={40} color={COLORS.error} />
          <Text style={styles.emptyTitle}>{errorMsg}</Text>
          <TouchableOpacity onPress={loadConversations}>
            <Text style={styles.retryLink}>Tap to retry</Text>
          </TouchableOpacity>
        </View>
      ) : conversations.length === 0 ? (
        <View style={styles.centerBox}>
          <Ionicons name="chatbubbles-outline" size={48} color={COLORS.placeholderText} />
          <Text style={styles.emptyTitle}>No messages yet</Text>
          <Text style={styles.emptySubtitle}>
            Tap "Chat" on any produce item to contact a farmer directly.
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => String(item.userId)}
          renderItem={renderConvItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}

      {/* ── Active Chat Modal ── */}
      <Modal
        visible={!!activeConv}
        animationType="slide"
        onRequestClose={() => setActiveConv(null)}
      >
        <SafeAreaView style={styles.chatSafeArea} edges={['top', 'bottom']}>
          {/* Chat Header */}
          <View style={styles.chatHeader}>
            <TouchableOpacity onPress={() => setActiveConv(null)} hitSlop={8}>
              <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
            </TouchableOpacity>
            <View style={styles.chatHeaderInfo}>
              <Text style={styles.chatFarmerName}>{activeConv?.userName}</Text>
              {activeConv?.produceName && (
                <Text style={styles.chatProduceSub}>{activeConv.produceName}</Text>
              )}
            </View>
            <View style={styles.onlineDot} />
          </View>

          <KeyboardAvoidingView
            style={styles.chatKeyboard}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            {/* Messages */}
            <ScrollView
              ref={scrollRef}
              contentContainerStyle={styles.chatMessagesContent}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() =>
                scrollRef.current?.scrollToEnd({ animated: true })
              }
            >
              {chatLoading ? (
                <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
              ) : messages.length === 0 ? (
                <Text style={styles.noMsgText}>
                  Start the conversation by sending a message.
                </Text>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === myUserId || msg.senderId !== activeConv?.userId;
                  return (
                    <View
                      key={msg.id}
                      style={[
                        styles.msgWrapper,
                        isMe ? styles.myMsgWrapper : styles.theirMsgWrapper,
                      ]}
                    >
                      <View
                        style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}
                      >
                        <Text style={[styles.msgText, isMe ? styles.myText : styles.theirText]}>
                          {msg.content}
                        </Text>
                        <Text style={[styles.msgTime, isMe ? styles.myTime : styles.theirTime]}>
                          {formatTime(msg.createdAt)}
                        </Text>
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>

            {/* Input Bar */}
            <View style={styles.inputBar}>
              <TextInput
                style={styles.textInput}
                placeholder="Write a message..."
                placeholderTextColor={COLORS.placeholderText}
                value={inputText}
                onChangeText={setInputText}
                returnKeyType="send"
                onSubmitEditing={handleSend}
                multiline
              />
              <TouchableOpacity
                style={[styles.sendBtn, (!inputText.trim() || sending) && styles.sendBtnOff]}
                onPress={handleSend}
                disabled={!inputText.trim() || sending}
              >
                {sending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="send" size={18} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.headingBold,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 13,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 10,
  },
  convCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  farmerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 18,
    fontFamily: FONTS.headingBold,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  convBody: {
    flex: 1,
  },
  convHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  farmerName: {
    fontSize: 14.5,
    fontFamily: FONTS.headingSemiBold,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  timeText: {
    fontSize: 11.5,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
  },
  produceTag: {
    fontSize: 11.5,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.accent,
    marginBottom: 2,
  },
  lastMsg: {
    fontSize: 13,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
  },
  unreadBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    fontSize: 11,
    fontFamily: FONTS.bodyBold,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 17,
    fontFamily: FONTS.headingSemiBold,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  retryLink: {
    fontSize: 13,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
    color: COLORS.primary,
  },
  chatSafeArea: {
    flex: 1,
    backgroundColor: '#F4F6FA',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatFarmerName: {
    fontSize: 16,
    fontFamily: FONTS.headingSemiBold,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  chatProduceSub: {
    fontSize: 11.5,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.accent,
  },
  onlineDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: COLORS.accent,
  },
  chatKeyboard: {
    flex: 1,
  },
  chatMessagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  noMsgText: {
    textAlign: 'center',
    fontSize: 13,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
    marginTop: 40,
  },
  msgWrapper: {
    flexDirection: 'row',
    width: '100%',
  },
  myMsgWrapper: { justifyContent: 'flex-end' },
  theirMsgWrapper: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '80%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  myBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 2,
  },
  theirBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  msgText: {
    fontSize: 13.5,
    fontFamily: FONTS.bodyRegular,
    lineHeight: 19,
  },
  myText: { color: '#FFFFFF' },
  theirText: { color: '#1A1A1A' },
  msgTime: {
    fontSize: 10,
    fontFamily: FONTS.bodyRegular,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  myTime: { color: 'rgba(255,255,255,0.65)' },
  theirTime: { color: COLORS.textSecondary },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 10,
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: '#F4F6FA',
    borderRadius: RADIUS.pill,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 13.5,
    fontFamily: FONTS.bodyRegular,
    color: '#1A1A1A',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnOff: {
    backgroundColor: '#C4C8D4',
  },
});
