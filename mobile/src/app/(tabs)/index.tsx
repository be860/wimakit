import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { COLORS, FONTS, RADIUS } from '../../constants/theme';
import { useAuth } from '../../context/auth-context';
import { useFavorites } from '../../context/favorites-context';
import { useChat } from '../../context/chat-context';
import { PRODUCE_CATEGORIES } from '../../constants/produce-categories';
import { produceApi, Produce } from '../../services/produce-api';
import { notificationsApi } from '../../services/notifications-api';
import { getErrorMessage } from '../../services/api-client';
import { ProduceCard } from '../../components/produce/ProduceCard';
import { ProduceDetailsModal } from '../../components/produce/ProduceDetailsModal';
import { PaginationDots } from '../../components/common/PaginationDots';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BANNER_SLIDES = [
  {
    id: 's1',
    title: 'Fresh produce\nfrom trusted farmers',
    subtitle: 'Buy directly from verified farmers in your community.',
    image: require('../../../assets/images/onboarding-1.jpg'),
  },
  {
    id: 's2',
    title: '100% Organic\nHarvest & Vegetables',
    subtitle: 'Straight from Sierra Leonean farms to your kitchen.',
    image: require('../../../assets/images/onboarding-2.jpg'),
  },
  {
    id: 's3',
    title: 'Bulk Produce &\nWholesale Pricing',
    subtitle: 'Connect with verified farmers for fair, direct prices.',
    image: require('../../../assets/images/onboarding-3.png'),
  },
];

const BENEFITS = [
  { icon: 'shield-checkmark-outline' as const, title: 'Verified Farmers', text: 'Trusted sellers only' },
  { icon: 'bag-handle-outline' as const, title: 'Fresh Produce', text: 'Straight from the farm' },
  { icon: 'chatbubbles-outline' as const, title: 'Chat Directly', text: 'Talk to farmers easily' },
  { icon: 'shield-checkmark-outline' as const, title: 'Safe Transactions', text: 'Secure and reliable' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { totalUnread } = useChat();

  const [featured, setFeatured] = useState<Produce[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [selectedProduce, setSelectedProduce] = useState<Produce | null>(null);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  const loadFeatured = useCallback(async () => {
    try {
      setErrorMsg(null);
      const all = await produceApi.getAll();
      setFeatured(all.slice(0, 8));
    } catch (err: any) {
      const msg = getErrorMessage(err, 'Could not load produce.');
      setErrorMsg(msg);
      Toast.show({ type: 'error', text1: 'Could not load produce', text2: msg });
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadFeatured().finally(() => setLoading(false));
  }, [loadFeatured]);

  useEffect(() => {
    notificationsApi
      .getAll()
      .then((data) => setHasUnreadNotifications(data.some((n) => n.isUnread)))
      .catch(() => {});
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFeatured();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning!';
    if (hour < 17) return 'Good Afternoon!';
    return 'Good Evening!';
  };

  const getUserInitials = () => {
    if (!user) return 'B';
    const f = user.firstName ? user.firstName[0] : '';
    const l = user.lastName ? user.lastName[0] : '';
    return (f + l).toUpperCase() || 'B';
  };

  const handleBannerScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideWidth = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideWidth);
    if (index !== activeBannerIndex) {
      setActiveBannerIndex(index);
    }
  };

  const openBrowse = (params?: { category?: string; search?: string }) => {
    router.push({ pathname: '/(tabs)/browse', params: params as any });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header matching Image 2 profile design */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.profileHeaderLeft}
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <View style={styles.avatarCircle}>
              {user?.profilePhotoUrl ? (
                <Image source={{ uri: user.profilePhotoUrl }} style={styles.avatarImg} />
              ) : (
                <Text style={styles.avatarInitials}>{getUserInitials()}</Text>
              )}
            </View>
            <View style={styles.headerTextCol}>
              <Text style={styles.userNameText} numberOfLines={1} allowFontScaling={false}>
                {user?.fullName || (user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Buyer')}
              </Text>
              <Text style={styles.greetingText} allowFontScaling={false}>
                {getGreeting()}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.headerRightActions}>
            <TouchableOpacity
              style={styles.actionIconBtn}
              onPress={() => router.push('/(tabs)/messages')}
              hitSlop={6}
            >
              <Ionicons name="chatbubbles-outline" size={22} color="#1A1A1A" />
              {totalUnread > 0 && <View style={styles.badgeDot} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionIconBtn}
              onPress={() => router.push('/notifications')}
              hitSlop={6}
            >
              <Ionicons name="notifications-outline" size={22} color="#1A1A1A" />
              {hasUnreadNotifications && <View style={styles.bellDot} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Row */}
        <View style={styles.searchRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.searchBar}
            onPress={() => openBrowse()}
          >
            <Ionicons name="search" size={18} color={COLORS.placeholderText} />
            <Text style={styles.searchPlaceholder} allowFontScaling={false}>
              Search for produce, farmers...
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => openBrowse()}
            hitSlop={4}
          >
            <Ionicons name="options-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Promo Banner Carousel matching Image 1 */}
        <View style={styles.bannerContainer}>
          <FlatList
            data={BANNER_SLIDES}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleBannerScroll}
            scrollEventThrottle={16}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={[styles.bannerSlide, { width: SCREEN_WIDTH - 40 }]}>
                <View style={styles.bannerTextCol}>
                  <Text style={styles.bannerTitle} allowFontScaling={false}>
                    {item.title}
                  </Text>
                  <Text style={styles.bannerSubtitle} allowFontScaling={false}>
                    {item.subtitle}
                  </Text>
                  <TouchableOpacity
                    style={styles.bannerBtn}
                    activeOpacity={0.85}
                    onPress={() => openBrowse()}
                  >
                    <Text style={styles.bannerBtnText} allowFontScaling={false}>
                      Shop now
                    </Text>
                  </TouchableOpacity>
                </View>
                <Image source={item.image} style={styles.bannerImage} resizeMode="cover" />
              </View>
            )}
          />
          <View style={styles.dotsWrapper}>
            <PaginationDots total={BANNER_SLIDES.length} activeIndex={activeBannerIndex} />
          </View>
        </View>

        {/* Categories Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle} allowFontScaling={false}>
            Categories
          </Text>
          <TouchableOpacity onPress={() => openBrowse()}>
            <Text style={styles.viewAll} allowFontScaling={false}>
              View all
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.categoriesRow}>
          {PRODUCE_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.value}
              style={styles.categoryItem}
              activeOpacity={0.75}
              onPress={() => openBrowse({ category: cat.value })}
            >
              <View style={styles.categoryIconCircle}>
                <Ionicons name={cat.icon} size={22} color={COLORS.accent} />
              </View>
              <Text style={styles.categoryLabel} numberOfLines={1} allowFontScaling={false}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Featured Produce Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle} allowFontScaling={false}>
            Featured produce
          </Text>
          <TouchableOpacity onPress={() => openBrowse()}>
            <Text style={styles.viewAll} allowFontScaling={false}>
              View all
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={COLORS.primary} />
          </View>
        ) : errorMsg ? (
          <View style={styles.loadingBox}>
            <Text style={styles.errorText} allowFontScaling={false}>
              {errorMsg}
            </Text>
            <TouchableOpacity onPress={loadFeatured}>
              <Text style={styles.retryText} allowFontScaling={false}>
                Tap to retry
              </Text>
            </TouchableOpacity>
          </View>
        ) : featured.length === 0 ? (
          <View style={styles.loadingBox}>
            <Text style={styles.emptyText} allowFontScaling={false}>
              No produce listed yet — check back soon.
            </Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredRow}
          >
            {featured.map((item) => (
              <ProduceCard
                key={item.id}
                produce={item}
                variant="horizontal"
                favorite={isFavorite(item.id)}
                onToggleFavorite={toggleFavorite}
                onPress={() => setSelectedProduce(item)}
              />
            ))}
          </ScrollView>
        )}

        {/* Why buy on WiMakit */}
        <Text style={[styles.sectionTitle, styles.whyBuyTitle]} allowFontScaling={false}>
          Why buy on WiMakit?
        </Text>
        <View style={styles.benefitsGrid}>
          {BENEFITS.map((b) => (
            <View key={b.title} style={styles.benefitItem}>
              <View style={styles.benefitIconCircle}>
                <Ionicons name={b.icon} size={18} color={COLORS.accent} />
              </View>
              <Text style={styles.benefitTitle} allowFontScaling={false}>
                {b.title}
              </Text>
              <Text style={styles.benefitText} allowFontScaling={false}>
                {b.text}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Produce Details Modal */}
      <ProduceDetailsModal
        produce={selectedProduce}
        visible={!!selectedProduce}
        onClose={() => setSelectedProduce(null)}
        onOpenChat={() => {
          setSelectedProduce(null);
          router.push('/(tabs)/messages');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  profileHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarInitials: {
    fontSize: 16,
    fontFamily: FONTS.headingBold,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerTextCol: {
    justifyContent: 'center',
  },
  userNameText: {
    fontSize: 16,
    fontFamily: FONTS.headingBold,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  greetingText: {
    fontSize: 12,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
  },
  bellDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.accent,
    borderWidth: 1.5,
    borderColor: COLORS.surface,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  searchBar: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 48,
    paddingHorizontal: 14,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 13.5,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.placeholderText,
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerContainer: {
    marginBottom: 24,
  },
  bannerSlide: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EAF3E4',
    borderRadius: RADIUS.card,
    padding: 18,
    overflow: 'hidden',
    height: 160,
  },
  bannerTextCol: {
    flex: 1,
    paddingRight: 8,
  },
  bannerTitle: {
    fontSize: 16.5,
    lineHeight: 21,
    fontFamily: FONTS.headingSemiBold,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 11.5,
    lineHeight: 16,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  bannerBtn: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
  },
  bannerBtnText: {
    fontSize: 12,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bannerImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  dotsWrapper: {
    marginTop: 10,
    alignItems: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.headingSemiBold,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  viewAll: {
    fontSize: 12.5,
    fontFamily: FONTS.bodyMedium,
    fontWeight: '500',
    color: COLORS.accent,
  },
  categoriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 26,
  },
  categoryItem: {
    alignItems: 'center',
    width: 62,
  },
  categoryIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EAF3E4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  categoryLabel: {
    fontSize: 11,
    fontFamily: FONTS.bodyMedium,
    fontWeight: '500',
    color: '#333333',
  },
  featuredRow: {
    gap: 12,
    paddingRight: 8,
    marginBottom: 28,
  },
  loadingBox: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  errorText: {
    fontSize: 13,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.error,
    marginBottom: 6,
    textAlign: 'center',
  },
  retryText: {
    fontSize: 12.5,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
    color: COLORS.primary,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  whyBuyTitle: {
    marginBottom: 14,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  benefitItem: {
    width: '47%',
  },
  benefitIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EAF3E4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  benefitTitle: {
    fontSize: 13,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  benefitText: {
    fontSize: 11.5,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
    lineHeight: 15,
  },
});
