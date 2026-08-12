import React, { useState } from 'react';
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
import { COLORS, FONTS, RADIUS } from '../../constants/theme';
import { useChat, Conversation } from '../../context/chat-context';

export default function MessagesScreen() {
  const { conversations, loading, refreshing, error, loadConversations, loadThread, sendMessage, markAsRead } =
    useChat();

  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [threadLoading, setThreadLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);

  const openConversation = async (conv: Conversation) => {
    setActiveConv(conv);
    setThreadLoading(true);
    const full = await loadThread(conv.farmerId);
    if (full) setActiveConv(full);
    setThreadLoading(false);
    markAsRead(conv.farmerId);
  };

  const handleSend = async () => {
    if (!activeConv || !inputText.trim() || sending) return;
    const text = inputText.trim();
    setInputText('');
    setSending(true);
    try {
      await sendMessage(activeConv.farmerId, text, activeConv.farmerName, activeConv.produceName, activeConv.produceId ?? undefined);
      const updated = await loadThread(activeConv.farmerId);
      if (updated) setActiveConv(updated);
    } catch (err: any) {
      // Restore the text so the buyer doesn't lose their message on failure.
      setInputText(text);
    } finally {
      setSending(false);
    }
  };

  const renderConvItem = ({ item }: { item: Conversation }) => {
    return (
      <TouchableOpacity
        style={styles.convCard}
        activeOpacity={0.8}
        onPress={() => openConversation(item)}
      >
        <View style={styles.farmerAvatar}>
          <Ionicons name="person" size={20} color={COLORS.primary} />
        </View>

        <View style={styles.convBody}>
          <View style={styles.convHeaderRow}>
            <Text style={styles.farmerName} numberOfLines={1} allowFontScaling={false}>
              {item.farmerName}
            </Text>
            <Text style={styles.timeText} allowFontScaling={false}>
              {item.timestamp}
            </Text>
          </View>

          {item.produceName && (
            <Text style={styles.produceTag} numberOfLines={1} allowFontScaling={false}>
              Re: {item.produceName}
            </Text>
          )}

          <Text style={styles.lastMsg} numberOfLines={1} allowFontScaling={false}>
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
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title} allowFontScaling={false}>
          Messages
        </Text>
        <Text style={styles.subtitle} allowFontScaling={false}>
          Direct chat with verified farmers
        </Text>
      </View>

      {loading && conversations.length === 0 ? (
        <View style={styles.centerBox}>
          <ActivityIndicator color={COLORS.primary} size="large" />
        </View>
      ) : error && conversations.length === 0 ? (
        <View style={styles.centerBox}>
          <Ionicons name="cloud-offline-outline" size={48} color={COLORS.placeholderText} />
          <Text style={styles.emptyTitle} allowFontScaling={false}>
            Couldn't load messages
          </Text>
          <Text style={styles.emptySubtitle} allowFontScaling={false}>
            {error}
          </Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => loadConversations()}>
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : conversations.length === 0 ? (
        <View style={styles.centerBox}>
          <Ionicons name="chatbubbles-outline" size={48} color={COLORS.placeholderText} />
          <Text style={styles.emptyTitle} allowFontScaling={false}>
            No messages yet
          </Text>
          <Text style={styles.emptySubtitle} allowFontScaling={false}>
            Tap "Chat" on any produce item or order to contact the farmer directly.
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderConvItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => loadConversations()} />
          }
        />
      )}

      {/* Active Conversation Chat Modal */}
      {activeConv && (
        <Modal visible={!!activeConv} animationType="slide" onRequestClose={() => setActiveConv(null)}>
          <SafeAreaView style={styles.chatSafeArea} edges={['top', 'bottom']}>
            <View style={styles.chatHeader}>
              <TouchableOpacity onPress={() => setActiveConv(null)} hitSlop={8}>
                <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
              </TouchableOpacity>
              <View style={styles.chatHeaderInfo}>
                <Text style={styles.chatFarmerName} allowFontScaling={false}>
                  {activeConv.farmerName}
                </Text>
                {activeConv.produceName && (
                  <Text style={styles.chatProduceSub} allowFontScaling={false}>
                    {activeConv.produceName}
                  </Text>
                )}
              </View>
              <View style={styles.onlineDot} />
            </View>

            <KeyboardAvoidingView
              style={styles.chatKeyboardContainer}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
              {threadLoading ? (
                <View style={styles.centerBox}>
                  <ActivityIndicator color={COLORS.primary} size="large" />
                </View>
              ) : (
                <ScrollView
                  contentContainerStyle={styles.chatMessagesContent}
                  showsVerticalScrollIndicator={false}
                >
                  {activeConv.messages.map((msg) => {
                    const isBuyer = msg.sender === 'buyer';
                    return (
                      <View
                        key={msg.id}
                        style={[
                          styles.msgBubbleWrapper,
                          isBuyer ? styles.buyerMsgWrapper : styles.farmerMsgWrapper,
                        ]}
                      >
                        <View
                          style={[
                            styles.msgBubble,
                            isBuyer ? styles.buyerBubble : styles.farmerBubble,
                          ]}
                        >
                          <Text
                            style={[
                              styles.msgText,
                              isBuyer ? styles.buyerMsgText : styles.farmerMsgText,
                            ]}
                          >
                            {msg.text}
                          </Text>
                          <Text
                            style={[
                              styles.msgTime,
                              isBuyer ? styles.buyerTimeText : styles.farmerTimeText,
                            ]}
                          >
                            {msg.timestamp}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </ScrollView>
              )}

              {/* Chat Input Bar */}
              <View style={styles.inputBar}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Write a message to farmer..."
                  placeholderTextColor={COLORS.placeholderText}
                  value={inputText}
                  onChangeText={setInputText}
                  returnKeyType="send"
                  onSubmitEditing={handleSend}
                  editable={!sending}
                />
                <TouchableOpacity
                  style={[styles.sendBtn, (!inputText.trim() || sending) && styles.sendBtnDisabled]}
                  onPress={handleSend}
                  disabled={!inputText.trim() || sending}
                >
                  {sending ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Ionicons name="send" size={18} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </Modal>
      )}
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
    marginTop: 20,
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
    backgroundColor: '#EBF3FA',
    alignItems: 'center',
    justifyContent: 'center',
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
    gap: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontFamily: FONTS.headingSemiBold,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  retryBtn: {
    marginTop: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: RADIUS.pill,
  },
  retryBtnText: {
    fontSize: 13.5,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
    color: '#FFFFFF',
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
  chatKeyboardContainer: {
    flex: 1,
  },
  chatMessagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  msgBubbleWrapper: {
    flexDirection: 'row',
    width: '100%',
  },
  buyerMsgWrapper: {
    justifyContent: 'flex-end',
  },
  farmerMsgWrapper: {
    justifyContent: 'flex-start',
  },
  msgBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  buyerBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 2,
  },
  farmerBubble: {
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
  buyerMsgText: {
    color: '#FFFFFF',
  },
  farmerMsgText: {
    color: '#1A1A1A',
  },
  msgTime: {
    fontSize: 10,
    fontFamily: FONTS.bodyRegular,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  buyerTimeText: {
    color: 'rgba(255,255,255,0.7)',
  },
  farmerTimeText: {
    color: COLORS.textSecondary,
  },
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
    height: 44,
    backgroundColor: '#F4F6FA',
    borderRadius: RADIUS.pill,
    paddingHorizontal: 16,
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
  sendBtnDisabled: {
    backgroundColor: '#C4C8D4',
  },
});
