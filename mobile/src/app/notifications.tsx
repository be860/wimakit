import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { COLORS, FONTS } from '../constants/theme';
import { notificationsApi, NotificationItem } from '../services/notifications-api';
import { getErrorMessage } from '../services/api-client';
import { useChat } from '../context/chat-context';

const TYPE_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  order: 'receipt-outline',
  product: 'leaf-outline',
  message: 'chatbubble-outline',
  broadcast: 'megaphone-outline',
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60_000) return 'Just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 604_800_000) return `${Math.floor(diff / 86_400_000)}d ago`;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function formatFullTime(iso: string): string {
  return new Date(iso).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { subscribeToRealtime } = useChat();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [viewingNotification, setViewingNotification] = useState<NotificationItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErrorMsg(null);
    try {
      const data = await notificationsApi.getAll();
      setNotifications(data);
    } catch (err: any) {
      const msg = getErrorMessage(err, 'Could not load notifications.');
      setErrorMsg(msg);
      Toast.show({ type: 'error', text1: 'Could not load notifications', text2: msg });
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  // New notifications (order updates, new produce listings, etc.) pushed
  // over the chat hub land at the top of the list live.
  useEffect(() => {
    return subscribeToRealtime((event) => {
      if (event.type !== 'notification') return;
      setNotifications((prev) =>
        prev.some((n) => n.id === event.notification.id) ? prev : [event.notification, ...prev]
      );
    });
  }, [subscribeToRealtime]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handlePress = (item: NotificationItem) => {
    // Always open the full notification — this used to only mark read
    // (and did nothing at all once a notification was already read), so
    // there was no way to see body text past the 2-line preview.
    setViewingNotification(item);
    if (!item.isUnread) return;

    // Flip it locally right away so the tap feels instant instead of waiting on the network.
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isUnread: false } : n))
    );
    notificationsApi.markAsRead(item.id).catch(() => {
      // Revert on failure so the unread state doesn't silently drift from the server.
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, isUnread: true } : n))
      );
    });
  };

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity
      style={[styles.card, item.isUnread && styles.cardUnread]}
      activeOpacity={0.8}
      onPress={() => handlePress(item)}
    >
      <View style={[styles.iconCircle, item.isUnread && styles.iconCircleUnread]}>
        <Ionicons
          name={TYPE_ICON[item.type] || 'notifications-outline'}
          size={18}
          color={item.isUnread ? '#FFFFFF' : COLORS.textSecondary}
        />
      </View>

      <View style={styles.body}>
        <View style={styles.headerRow}>
          <Text style={styles.itemTitle} numberOfLines={1} allowFontScaling={false}>
            {item.title}
          </Text>
          <Text style={styles.itemTime} allowFontScaling={false}>
            {formatTime(item.createdAt)}
          </Text>
        </View>
        <Text style={styles.itemBody} numberOfLines={2} allowFontScaling={false}>
          {item.body}
        </Text>
      </View>

      {item.isUnread && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.title} allowFontScaling={false}>
          Notifications
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator color={COLORS.primary} size="large" />
        </View>
      ) : errorMsg ? (
        <View style={styles.centerBox}>
          <Ionicons name="alert-circle-outline" size={40} color={COLORS.error} />
          <Text style={styles.emptyTitle} allowFontScaling={false}>
            {errorMsg}
          </Text>
          <TouchableOpacity onPress={load}>
            <Text style={styles.retryLink} allowFontScaling={false}>
              Tap to retry
            </Text>
          </TouchableOpacity>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.centerBox}>
          <Ionicons name="notifications-outline" size={48} color={COLORS.placeholderText} />
          <Text style={styles.emptyTitle} allowFontScaling={false}>
            No notifications yet
          </Text>
          <Text style={styles.emptySubtitle} allowFontScaling={false}>
            Order updates and news from WiMakit will show up here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}

      <Modal
        visible={!!viewingNotification}
        animationType="slide"
        transparent
        onRequestClose={() => setViewingNotification(null)}
      >
        <View style={styles.detailOverlay}>
          {/* Backdrop as a sibling behind the sheet, not a wrapper around it —
              wrapping would fight the ScrollView below for the touch
              responder (same issue fixed in ProduceDetailsModal). */}
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setViewingNotification(null)} />
          <View style={styles.detailSheet}>
            {viewingNotification && (
              <>
                <View style={styles.detailDragHandle} />
                <View style={styles.detailHeaderRow}>
                  <View style={[styles.iconCircle, styles.iconCircleUnread]}>
                    <Ionicons
                      name={TYPE_ICON[viewingNotification.type] || 'notifications-outline'}
                      size={20}
                      color="#FFFFFF"
                    />
                  </View>
                  <TouchableOpacity onPress={() => setViewingNotification(null)} hitSlop={8}>
                    <Ionicons name="close" size={22} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.detailTitle} allowFontScaling={false}>
                  {viewingNotification.title}
                </Text>
                <Text style={styles.detailTime} allowFontScaling={false}>
                  {formatFullTime(viewingNotification.createdAt)}
                </Text>
                <ScrollView style={styles.detailBodyScroll} showsVerticalScrollIndicator={false}>
                  <Text style={styles.detailBody} allowFontScaling={false}>
                    {viewingNotification.body}
                  </Text>
                </ScrollView>
              </>
            )}
          </View>
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: FONTS.headingSemiBold,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  cardUnread: {
    borderColor: COLORS.primary,
    backgroundColor: '#F5F8FF',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F0F4FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleUnread: {
    backgroundColor: COLORS.primary,
  },
  body: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  itemTitle: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.headingSemiBold,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  itemTime: {
    fontSize: 11,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
  },
  itemBody: {
    fontSize: 13,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
    marginTop: 5,
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
  detailOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  detailSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
    maxHeight: '75%',
  },
  detailDragHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    marginBottom: 16,
  },
  detailHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  detailTitle: {
    fontSize: 18,
    fontFamily: FONTS.headingSemiBold,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  detailTime: {
    fontSize: 12,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
    marginBottom: 14,
  },
  detailBodyScroll: {
    maxHeight: 260,
  },
  detailBody: {
    fontSize: 14.5,
    fontFamily: FONTS.bodyRegular,
    color: '#333333',
    lineHeight: 21,
  },
});
