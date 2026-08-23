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
  Image,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import {
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from 'expo-audio';
import Toast from 'react-native-toast-message';
import { COLORS, FONTS, RADIUS } from '../../constants/theme';
import { getErrorMessage } from '../../services/api-client';
import { useAuth } from '../../context/auth-context';
import { useChat } from '../../context/chat-context';
import { messagesApi, MessageDTO, ConversationDTO } from '../../services/messages-api';

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

function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds || 0));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

/** Local mirror of the server-computed conversation preview, used only for the
 *  optimistic local update right after sending — the real value always comes
 *  from a fresh GET /api/messages/conversations. */
function previewForMessage(msg: MessageDTO): string {
  if (msg.messageType === 'voice') return '🎤 Voice message';
  if (msg.messageType === 'image') return '📷 Photo';
  return msg.content;
}

// ────────────────────────────────────────────────────────────────
// Voice message bubble — owns its own player instance
// ────────────────────────────────────────────────────────────────

function VoiceMessageBubble({
  url,
  durationSeconds,
  isMe,
}: {
  url?: string | null;
  durationSeconds?: number | null;
  isMe: boolean;
}) {
  const player = useAudioPlayer(url ?? null);
  const status = useAudioPlayerStatus(player);

  const totalSeconds = durationSeconds ?? Math.round(status.duration || 0);
  const remaining = status.playing
    ? Math.max(totalSeconds - Math.round(status.currentTime || 0), 0)
    : totalSeconds;

  const togglePlayback = () => {
    if (!url) return;
    if (status.playing) {
      player.pause();
      return;
    }
    if (status.duration > 0 && status.currentTime >= status.duration) {
      player.seekTo(0);
    }
    player.play();
  };

  return (
    <TouchableOpacity style={styles.voiceRow} onPress={togglePlayback} activeOpacity={0.7}>
      <Ionicons
        name={status.playing ? 'pause-circle' : 'play-circle'}
        size={32}
        color={isMe ? '#FFFFFF' : COLORS.primary}
      />
      <Text style={[styles.voiceDurationText, isMe ? styles.myText : styles.theirText]}>
        {formatDuration(remaining)}
      </Text>
    </TouchableOpacity>
  );
}

// ────────────────────────────────────────────────────────────────
// Screen
// ────────────────────────────────────────────────────────────────

export default function MessagesScreen() {
  const { user } = useAuth();
  const { subscribeToRealtime } = useChat();
  const myUserId = user?.id ?? null;

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
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [viewingImageUrl, setViewingImageUrl] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  // Voice recording
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 200);
  const [isRecording, setIsRecording] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isRecording) {
      pulseAnim.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.25, duration: 550, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 550, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isRecording, pulseAnim]);

  const loadConversations = useCallback(async () => {
    setErrorMsg(null);
    try {
      const data = await messagesApi.getConversations();
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

  // Live updates pushed over the SignalR chat hub. `messages` already only
  // holds the currently open thread, so edit/delete/read updates can just map
  // over it by id — that's a no-op for events belonging to some other thread.
  useEffect(() => {
    const unsubscribe = subscribeToRealtime((event) => {
      const openUserId = activeConv?.userId ?? null;

      if (event.type === 'received') {
        const msg = event.message;
        const belongsToOpenThread =
          openUserId != null && (msg.senderId === openUserId || msg.receiverId === openUserId);

        if (belongsToOpenThread) {
          setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
          setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

          if (msg.senderId === openUserId && msg.receiverId === myUserId) {
            messagesApi.markAsRead(msg.id).catch(() => {});
          }
        }
        loadConversations();
        return;
      }

      if (event.type === 'edited' || event.type === 'deleted') {
        const msg = event.message;
        setMessages((prev) => prev.map((m) => (m.id === msg.id ? msg : m)));
        loadConversations();
        return;
      }

      if (event.type === 'read') {
        // Flip read receipts for messages in the open thread; a no-op if none
        // of the ids are currently displayed.
        setMessages((prev) =>
          prev.map((m) => (event.messageIds.includes(m.id) ? { ...m, isRead: true } : m))
        );
      }
      // Other event types (orders, notifications) are handled elsewhere.
    });

    return unsubscribe;
  }, [activeConv, myUserId, subscribeToRealtime, loadConversations]);

  const openConversation = async (conv: ConversationDTO) => {
    setActiveConv(conv);
    setChatLoading(true);
    setMessages([]);
    setInputText('');
    setEditingMessageId(null);

    try {
      const data = await messagesApi.getConversation(conv.userId);
      setMessages(data);

      // Mark unread messages as read
      const unread = data.filter((m) => !m.isRead && m.senderId === conv.userId);
      for (const msg of unread) {
        messagesApi.markAsRead(msg.id).catch(() => {});
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

  const closeConversation = () => {
    if (isRecording) {
      recorder.stop().catch(() => {});
      setIsRecording(false);
    }
    setEditingMessageId(null);
    setInputText('');
    setActiveConv(null);
  };

  // The chat hub echoes a sent message back to the sender's own connection
  // too (it's pushed to both participants' groups), and that push can win the
  // race against this REST response — dedup by id so it doesn't render twice.
  const appendSentMessage = (sent: MessageDTO) => {
    setMessages((prev) => (prev.some((m) => m.id === sent.id) ? prev : [...prev, sent]));
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    setConversations((prev) =>
      prev.map((c) =>
        c.userId === activeConv?.userId
          ? { ...c, lastMessage: previewForMessage(sent), lastMessageTime: sent.createdAt }
          : c
      )
    );
  };

  // ─── Text send / edit ───
  const handleSend = async () => {
    if (!activeConv || !inputText.trim() || sending) return;
    const text = inputText.trim();

    if (editingMessageId) {
      setSending(true);
      try {
        const updated = await messagesApi.editMessage(editingMessageId, text);
        setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
        setEditingMessageId(null);
        setInputText('');
      } catch (err) {
        Toast.show({
          type: 'error',
          text1: 'Could not edit message',
          text2: getErrorMessage(err, 'Please try again.'),
        });
      } finally {
        setSending(false);
      }
      return;
    }

    setInputText('');
    setSending(true);

    try {
      const sent = await messagesApi.sendMessage({
        receiverId: activeConv.userId,
        content: text,
        produceId: activeConv.produceId ?? undefined,
      });
      appendSentMessage(sent);
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

  const startEditingMessage = (msg: MessageDTO) => {
    setEditingMessageId(msg.id);
    setInputText(msg.content);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setInputText('');
  };

  // ─── Delete ───
  const deleteMessage = async (msg: MessageDTO) => {
    try {
      await messagesApi.deleteMessage(msg.id);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msg.id
            ? { ...m, isDeleted: true, content: '', attachmentUrl: null, attachmentDurationSeconds: null }
            : m
        )
      );
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Could not delete message',
        text2: getErrorMessage(err, 'Please try again.'),
      });
    }
  };

  const handleLongPressMessage = (msg: MessageDTO) => {
    if (myUserId == null || msg.senderId !== myUserId || msg.isDeleted) return;

    const buttons: Array<{ text: string; style?: 'default' | 'cancel' | 'destructive'; onPress?: () => void }> = [];

    if (msg.messageType === 'text') {
      buttons.push({ text: 'Edit', onPress: () => startEditingMessage(msg) });
    }

    buttons.push({
      text: 'Delete',
      style: 'destructive',
      onPress: () =>
        Alert.alert(
          'Delete message?',
          'This message will be removed for both you and the other person.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => deleteMessage(msg) },
          ]
        ),
    });

    buttons.push({ text: 'Cancel', style: 'cancel' });

    Alert.alert('Message options', undefined, buttons);
  };

  // ─── Voice recording ───
  const startRecording = async () => {
    if (uploadingAttachment || editingMessageId) return;
    try {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) {
        Toast.show({
          type: 'error',
          text1: 'Microphone access needed',
          text2: 'Please allow WiMakit to access your microphone to send voice messages.',
        });
        return;
      }

      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setIsRecording(true);
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Could not start recording',
        text2: getErrorMessage(err, 'Please try again.'),
      });
    }
  };

  const cancelRecording = async () => {
    try {
      setIsRecording(false);
      await recorder.stop();
    } catch {
      // Discarding — nothing to surface to the user here.
    }
  };

  const stopRecordingAndSend = async () => {
    if (!activeConv) return;
    const durationSeconds = Math.round((recorderState.durationMillis || 0) / 1000);
    setIsRecording(false);

    try {
      await recorder.stop();
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Could not stop recording',
        text2: getErrorMessage(err, 'Please try again.'),
      });
      return;
    }

    const uri = recorder.uri;
    if (!uri) return;

    setUploadingAttachment(true);
    try {
      const formData = new FormData();
      const name = `voice-${Date.now()}.m4a`;
      formData.append(
        'file',
        Platform.OS === 'web'
          ? await (await fetch(uri)).blob()
          : ({ uri, name, type: 'audio/m4a' } as any)
      );

      const uploadRes = await messagesApi.uploadAttachment(formData);
      const sent = await messagesApi.sendMessage({
        receiverId: activeConv.userId,
        produceId: activeConv.produceId ?? undefined,
        messageType: 'voice',
        attachmentUrl: uploadRes.url,
        attachmentDurationSeconds: durationSeconds,
      });
      appendSentMessage(sent);
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Voice message not sent',
        text2: getErrorMessage(err, 'Please try again.'),
      });
    } finally {
      setUploadingAttachment(false);
    }
  };

  // ─── Image attachment ───
  const handlePickImage = async () => {
    if (uploadingAttachment || editingMessageId) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Toast.show({
        type: 'error',
        text1: 'Photo access needed',
        text2: 'Please allow WiMakit to access your photos so you can send images.',
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    await sendImageMessage(asset.uri, asset.mimeType, asset.fileName);
  };

  const sendImageMessage = async (uri: string, mimeType?: string | null, fileName?: string | null) => {
    if (!activeConv) return;
    setUploadingAttachment(true);

    try {
      const inferredExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const type = mimeType || (inferredExt === 'png' ? 'image/png' : 'image/jpeg');
      const name = fileName || `chat-photo.${inferredExt}`;

      const formData = new FormData();
      formData.append(
        'file',
        Platform.OS === 'web'
          ? await (await fetch(uri)).blob()
          : ({ uri, name, type } as any)
      );

      const uploadRes = await messagesApi.uploadAttachment(formData);
      const sent = await messagesApi.sendMessage({
        receiverId: activeConv.userId,
        produceId: activeConv.produceId ?? undefined,
        messageType: 'image',
        attachmentUrl: uploadRes.url,
      });
      appendSentMessage(sent);
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Photo not sent',
        text2: getErrorMessage(err, 'Please try again.'),
      });
    } finally {
      setUploadingAttachment(false);
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
        {item.userProfilePhotoUrl ? (
          <Image source={{ uri: item.userProfilePhotoUrl }} style={styles.avatarImage} />
        ) : (
          <Text style={styles.avatarInitial}>
            {(item.userName || 'F')[0].toUpperCase()}
          </Text>
        )}
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
        onRequestClose={closeConversation}
      >
        <SafeAreaView style={styles.chatSafeArea} edges={['top', 'bottom']}>
          {/* Chat Header */}
          <View style={styles.chatHeader}>
            <TouchableOpacity onPress={closeConversation} hitSlop={8}>
              <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
            </TouchableOpacity>
            <View style={styles.chatHeaderAvatar}>
              {activeConv?.userProfilePhotoUrl ? (
                <Image source={{ uri: activeConv.userProfilePhotoUrl }} style={styles.chatHeaderAvatarImg} />
              ) : (
                <Text style={styles.chatHeaderAvatarInitial}>
                  {(activeConv?.userName || 'F')[0].toUpperCase()}
                </Text>
              )}
            </View>
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
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
                  const isMe = msg.senderId === myUserId;
                  const canLongPress = isMe && !msg.isDeleted;

                  return (
                    <View
                      key={msg.id}
                      style={[
                        styles.msgWrapper,
                        isMe ? styles.myMsgWrapper : styles.theirMsgWrapper,
                      ]}
                    >
                      <TouchableOpacity
                        activeOpacity={canLongPress ? 0.7 : 1}
                        onLongPress={canLongPress ? () => handleLongPressMessage(msg) : undefined}
                        style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}
                      >
                        {msg.isDeleted ? (
                          <Text
                            style={[
                              styles.deletedText,
                              isMe ? styles.myText : styles.theirText,
                            ]}
                          >
                            This message was deleted
                          </Text>
                        ) : msg.messageType === 'voice' ? (
                          <VoiceMessageBubble
                            url={msg.attachmentUrl}
                            durationSeconds={msg.attachmentDurationSeconds}
                            isMe={isMe}
                          />
                        ) : msg.messageType === 'image' ? (
                          <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={() => msg.attachmentUrl && setViewingImageUrl(msg.attachmentUrl)}
                          >
                            <Image
                              source={{ uri: msg.attachmentUrl || undefined }}
                              style={styles.imageBubble}
                              resizeMode="cover"
                            />
                          </TouchableOpacity>
                        ) : (
                          <Text style={[styles.msgText, isMe ? styles.myText : styles.theirText]}>
                            {msg.content}
                          </Text>
                        )}

                        <View style={styles.msgFooterRow}>
                          {msg.isEdited && !msg.isDeleted && (
                            <Text
                              style={[
                                styles.editedLabel,
                                isMe ? styles.myTime : styles.theirTime,
                              ]}
                            >
                              (edited)
                            </Text>
                          )}
                          <Text style={[styles.msgTime, isMe ? styles.myTime : styles.theirTime]}>
                            {formatTime(msg.createdAt)}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}
            </ScrollView>

            {editingMessageId && (
              <View style={styles.editingBanner}>
                <Ionicons name="create-outline" size={14} color={COLORS.primary} />
                <Text style={styles.editingBannerText}>Editing message</Text>
                <TouchableOpacity onPress={cancelEditing} hitSlop={6}>
                  <Ionicons name="close" size={16} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
            )}

            {/* Input Bar / Recording Bar */}
            {isRecording ? (
              <View style={styles.recordingBar}>
                <View style={styles.recordingIndicator}>
                  <Animated.View style={[styles.recordingDot, { opacity: pulseAnim }]} />
                  <Text style={styles.recordingTimeText}>
                    {formatDuration((recorderState.durationMillis || 0) / 1000)}
                  </Text>
                  <Text style={styles.recordingHintText}>Recording…</Text>
                </View>
                <TouchableOpacity style={styles.cancelRecordBtn} onPress={cancelRecording} hitSlop={8}>
                  <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.stopRecordBtn} onPress={stopRecordingAndSend} hitSlop={8}>
                  <Ionicons name="stop-circle" size={38} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.inputBar}>
                <TouchableOpacity
                  style={styles.attachBtn}
                  onPress={handlePickImage}
                  disabled={uploadingAttachment || !!editingMessageId}
                  hitSlop={6}
                >
                  <Ionicons
                    name="image-outline"
                    size={22}
                    color={uploadingAttachment || editingMessageId ? COLORS.placeholderText : COLORS.primary}
                  />
                </TouchableOpacity>

                <TextInput
                  style={styles.textInput}
                  placeholder={editingMessageId ? 'Edit your message...' : 'Write a message...'}
                  placeholderTextColor={COLORS.placeholderText}
                  value={inputText}
                  onChangeText={setInputText}
                  returnKeyType="send"
                  onSubmitEditing={handleSend}
                  multiline
                />

                {inputText.trim() ? (
                  <TouchableOpacity
                    style={[styles.sendBtn, sending && styles.sendBtnOff]}
                    onPress={handleSend}
                    disabled={sending}
                  >
                    {sending ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Ionicons name={editingMessageId ? 'checkmark' : 'send'} size={18} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.sendBtn, uploadingAttachment && styles.sendBtnOff]}
                    onPress={startRecording}
                    disabled={uploadingAttachment}
                  >
                    {uploadingAttachment ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Ionicons name="mic" size={20} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                )}
              </View>
            )}
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* ── Full-screen image viewer ── */}
      <Modal
        visible={!!viewingImageUrl}
        animationType="fade"
        transparent
        onRequestClose={() => setViewingImageUrl(null)}
      >
        <TouchableOpacity
          style={styles.imageViewerOverlay}
          activeOpacity={1}
          onPress={() => setViewingImageUrl(null)}
        >
          {viewingImageUrl && (
            <Image source={{ uri: viewingImageUrl }} style={styles.fullImage} resizeMode="contain" />
          )}
          <TouchableOpacity
            style={styles.imageViewerCloseBtn}
            onPress={() => setViewingImageUrl(null)}
            hitSlop={10}
          >
            <Ionicons name="close" size={26} color="#FFFFFF" />
          </TouchableOpacity>
        </TouchableOpacity>
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
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
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
  chatHeaderAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  chatHeaderAvatarImg: {
    width: '100%',
    height: '100%',
  },
  chatHeaderAvatarInitial: {
    fontSize: 13,
    fontFamily: FONTS.headingBold,
    fontWeight: '700',
    color: '#FFFFFF',
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
  deletedText: {
    fontSize: 13,
    fontFamily: FONTS.bodyRegular,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  myText: { color: '#FFFFFF' },
  theirText: { color: '#1A1A1A' },
  msgFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 5,
    marginTop: 4,
  },
  editedLabel: {
    fontSize: 10,
    fontFamily: FONTS.bodyRegular,
    fontStyle: 'italic',
  },
  msgTime: {
    fontSize: 10,
    fontFamily: FONTS.bodyRegular,
  },
  myTime: { color: 'rgba(255,255,255,0.65)' },
  theirTime: { color: COLORS.textSecondary },
  voiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
    minWidth: 120,
  },
  voiceDurationText: {
    fontSize: 13,
    fontFamily: FONTS.bodyMedium,
  },
  imageBubble: {
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: '#EDEFF3',
  },
  editingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF3FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  editingBannerText: {
    flex: 1,
    fontSize: 12,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.primary,
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
  attachBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
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
  recordingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 10,
  },
  recordingIndicator: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.error,
  },
  recordingTimeText: {
    fontSize: 14,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  recordingHintText: {
    fontSize: 12.5,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
  },
  cancelRecordBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopRecordBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageViewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullImage: {
    width: '100%',
    height: '80%',
  },
  imageViewerCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
