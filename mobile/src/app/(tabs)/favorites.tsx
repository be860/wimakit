import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS } from '../../constants/theme';
import { useFavorites } from '../../context/favorites-context';
import { produceApi, Produce } from '../../services/produce-api';
import { ProduceCard } from '../../components/produce/ProduceCard';

export default function FavoritesScreen() {
  const router = useRouter();
  const { favoriteIds, isFavorite, toggleFavorite } = useFavorites();

  const [favorites, setFavorites] = useState<Produce[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFavorites() {
      if (favoriteIds.size === 0) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const all = await produceApi.getAll();
        const filtered = all.filter((item) => favoriteIds.has(item.id));
        setFavorites(filtered);
      } catch (err) {
        console.warn('Could not load favorites:', err);
      } finally {
        setLoading(false);
      }
    }

    loadFavorites();
  }, [favoriteIds]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title} allowFontScaling={false}>
          Saved Favorites
        </Text>
        <Text style={styles.subtitle} allowFontScaling={false}>
          {favorites.length} item{favorites.length === 1 ? '' : 's'} saved
        </Text>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator color={COLORS.primary} size="large" />
        </View>
      ) : favorites.length === 0 ? (
        <View style={styles.centerBox}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="heart-outline" size={36} color={COLORS.accent} />
          </View>
          <Text style={styles.emptyTitle} allowFontScaling={false}>
            No favorites saved yet
          </Text>
          <Text style={styles.emptySubtitle} allowFontScaling={false}>
            Tap the heart icon on any produce item to save it here for quick access.
          </Text>
          <TouchableOpacity
            style={styles.browseBtn}
            activeOpacity={0.85}
            onPress={() => router.push('/(tabs)/browse')}
          >
            <Text style={styles.browseBtnText} allowFontScaling={false}>
              Browse produce catalog
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favorites}
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
              onPress={() =>
                router.push({
                  pathname: '/(tabs)/browse',
                  params: { search: item.name },
                })
              }
            />
          )}
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
  gridContent: {
    paddingHorizontal: 20,
    paddingBottom: 28,
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
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EAF3E4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: FONTS.headingSemiBold,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13.5,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  browseBtn: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: RADIUS.pill,
  },
  browseBtnText: {
    fontSize: 14,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
