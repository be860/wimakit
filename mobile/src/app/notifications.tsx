import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { COLORS, FONTS } from '../constants/theme';
import { notificationsApi, NotificationItem } from '../services/notifications-api';
import { getErrorMessage } from '../services/api-client';

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

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
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

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handlePress = (item: NotificationItem) => {
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
});
