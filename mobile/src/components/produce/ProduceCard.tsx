import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS } from '../../constants/theme';
import { Produce, formatLE } from '../../services/produce-api';

interface ProduceCardProps {
  produce: Produce;
  favorite: boolean;
  onToggleFavorite: (id: number) => void;
  onPress: (produce: Produce) => void;
  /** 'grid' = half-width card used in the Browse 2-column grid.
   *  'horizontal' = fixed-width card used in the Home featured carousel. */
  variant?: 'grid' | 'horizontal';
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=60';

export function ProduceCard({
  produce,
  favorite,
  onToggleFavorite,
  onPress,
  variant = 'grid',
}: ProduceCardProps) {
  const location = produce.location || produce.farmerLocation;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[styles.card, variant === 'horizontal' && styles.cardHorizontal]}
      onPress={() => onPress(produce)}
    >
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: produce.imageUrl || FALLBACK_IMAGE }}
          style={styles.image}
          resizeMode="cover"
        />
        <TouchableOpacity
          hitSlop={8}
          style={styles.favoriteBtn}
          onPress={() => onToggleFavorite(produce.id)}
        >
          <Ionicons
            name={favorite ? 'heart' : 'heart-outline'}
            size={18}
            color={favorite ? COLORS.error : '#FFFFFF'}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1} allowFontScaling={false}>
          {produce.name}
        </Text>
        <Text style={styles.description} numberOfLines={1} allowFontScaling={false}>
          {produce.description}
        </Text>
        <Text style={styles.price} allowFontScaling={false}>
          {formatLE(produce.price)} / {produce.unit}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="person-outline" size={12} color={COLORS.textSecondary} />
            <Text style={styles.metaText} numberOfLines={1} allowFontScaling={false}>
              {produce.farmerName}
            </Text>
          </View>
          {!!location && (
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={12} color={COLORS.textSecondary} />
              <Text style={styles.metaText} numberOfLines={1} allowFontScaling={false}>
                {location}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 0,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  cardHorizontal: {
    flex: 0,
    width: 168,
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 1.15,
    backgroundColor: '#EDEFF3',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favoriteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: 10,
  },
  name: {
    fontSize: 14,
    fontFamily: FONTS.headingSemiBold,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  description: {
    fontSize: 11.5,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  price: {
    fontSize: 13,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
    color: COLORS.accent,
    marginBottom: 8,
  },
  metaRow: {
    gap: 3,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    flex: 1,
    fontSize: 11,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
  },
});
