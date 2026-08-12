import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS } from '../../constants/theme';
import { useFavorites } from '../../context/favorites-context';
import { PRODUCE_CATEGORIES } from '../../constants/produce-categories';
import { produceApi, Produce } from '../../services/produce-api';
import { ProduceCard } from '../../components/produce/ProduceCard';
import { ProduceDetailsModal } from '../../components/produce/ProduceDetailsModal';

type SortOption = 'recent' | 'price_asc' | 'price_desc';

const SORT_LABELS: Record<SortOption, string> = {
  recent: 'Most recent',
  price_asc: 'Price: Low to High',
  price_desc: 'Price: High to Low',
};

export default function BrowseScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string; search?: string }>();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [query, setQuery] = useState(params.search || '');
  const [activeCategory, setActiveCategory] = useState<string | null>(params.category || null);
  const [sort, setSort] = useState<SortOption>('recent');
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  const [items, setItems] = useState<Produce[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedProduce, setSelectedProduce] = useState<Produce | null>(null);

  const load = useCallback(async (search: string, category: string | null) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const results = await produceApi.getAll({
        search: search.trim() || undefined,
        category: category || undefined,
      });
      setItems(results);
    } catch (err: any) {
      setErrorMsg(err.data?.message || err.message || 'Could not load produce.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Re-run whenever the category changes (chip tap or arriving from Home with a
  // category param), and debounce free-text search so we're not hitting the
  // API on every keystroke.
  useEffect(() => {
    const handle = setTimeout(() => {
      load(query, activeCategory);
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, activeCategory]);

  const sortedItems = useMemo(() => {
    const copy = [...items];
    if (sort === 'price_asc') copy.sort((a, b) => a.price - b.price);
    if (sort === 'price_desc') copy.sort((a, b) => b.price - a.price);
    return copy;
  }, [items, sort]);

  const openProduce = (produce: Produce) => {
    setSelectedProduce(produce);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title} allowFontScaling={false}>
          Browse
        </Text>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={COLORS.placeholderText} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for produce, farmers..."
            placeholderTextColor={COLORS.placeholderText}
            allowFontScaling={false}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={6}>
              <Ionicons name="close-circle" size={16} color={COLORS.placeholderText} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.filtersBtn}
          activeOpacity={0.8}
          onPress={() => setSortMenuOpen(true)}
        >
          <Ionicons name="options-outline" size={16} color={COLORS.primary} />
          <Text style={styles.filtersBtnText} allowFontScaling={false}>
            Filters
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.chipsRow}>
        <FlatList
          data={[{ label: 'All', value: null as string | null }, ...PRODUCE_CATEGORIES.map((c) => ({ label: c.label, value: c.value }))]}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.label}
          contentContainerStyle={styles.chipsContent}
          renderItem={({ item }) => {
            const active = activeCategory === item.value;
            return (
              <TouchableOpacity
                style={[styles.chip, active && styles.chipActive]}
                activeOpacity={0.8}
                onPress={() => setActiveCategory(item.value)}
              >
                <Text
                  style={[styles.chipText, active && styles.chipTextActive]}
                  allowFontScaling={false}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.itemCount} allowFontScaling={false}>
          {loading ? 'Loading…' : `${sortedItems.length} item${sortedItems.length === 1 ? '' : 's'}`}
        </Text>
        <TouchableOpacity
          style={styles.sortBtn}
          activeOpacity={0.8}
          onPress={() => setSortMenuOpen(true)}
        >
          <Text style={styles.sortBtnText} numberOfLines={1} allowFontScaling={false}>
            {SORT_LABELS[sort]}
          </Text>
          <Ionicons name="chevron-down" size={14} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator color={COLORS.primary} />
        </View>
      ) : errorMsg ? (
        <View style={styles.centerBox}>
          <Text style={styles.errorText} allowFontScaling={false}>
            {errorMsg}
          </Text>
          <TouchableOpacity onPress={() => load(query, activeCategory)}>
            <Text style={styles.retryText} allowFontScaling={false}>
              Tap to retry
            </Text>
          </TouchableOpacity>
        </View>
      ) : sortedItems.length === 0 ? (
        <View style={styles.centerBox}>
          <Ionicons name="leaf-outline" size={32} color={COLORS.placeholderText} />
          <Text style={styles.emptyText} allowFontScaling={false}>
            No produce matches your search.
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedItems}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ProduceCard
              produce={item}
              variant="grid"
              favorite={isFavorite(item.id)}
              onToggleFavorite={toggleFavorite}
              onPress={openProduce}
            />
          )}
        />
      )}

      <Modal
        visible={sortMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSortMenuOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSortMenuOpen(false)}
        >
          <View style={styles.sortSheet}>
            <Text style={styles.sortSheetTitle} allowFontScaling={false}>
              Sort by
            </Text>
            {(Object.keys(SORT_LABELS) as SortOption[]).map((opt) => (
              <TouchableOpacity
                key={opt}
                style={styles.sortOption}
                onPress={() => {
                  setSort(opt);
                  setSortMenuOpen(false);
                }}
              >
                <Text style={styles.sortOptionText} allowFontScaling={false}>
                  {SORT_LABELS[opt]}
                </Text>
                {sort === opt && (
                  <Ionicons name="checkmark" size={18} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Produce Details bottom-sheet modal */}
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
  header: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 14,
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.headingBold,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  searchBar: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 46,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    fontSize: 13.5,
    fontFamily: FONTS.bodyRegular,
    color: '#222222',
  },
  filtersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  filtersBtnText: {
    fontSize: 13,
    fontFamily: FONTS.bodyMedium,
    fontWeight: '500',
    color: COLORS.primary,
  },
  chipsRow: {
    marginBottom: 14,
  },
  chipsContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    height: 36,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#EAF3E4',
    borderColor: COLORS.accent,
  },
  chipText: {
    fontSize: 13,
    fontFamily: FONTS.bodyMedium,
    fontWeight: '500',
    color: '#333333',
  },
  chipTextActive: {
    color: COLORS.accent,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  itemCount: {
    fontSize: 13,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: 170,
  },
  sortBtnText: {
    fontSize: 13,
    fontFamily: FONTS.bodyMedium,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  gridContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  gridRow: {
    gap: 12,
    marginBottom: 12,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 8,
  },
  errorText: {
    fontSize: 13,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.error,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sortSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.card,
    borderTopRightRadius: RADIUS.card,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 32,
  },
  sortSheetTitle: {
    fontSize: 15,
    fontFamily: FONTS.headingSemiBold,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F7',
  },
  sortOptionText: {
    fontSize: 14,
    fontFamily: FONTS.bodyRegular,
    color: '#333333',
  },
});
