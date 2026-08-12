import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/theme';

interface PaginationDotsProps {
  total?: number;
  activeIndex: number;
}

export function PaginationDots({ total = 3, activeIndex }: PaginationDotsProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, index) => {
        const isActive = index === activeIndex;
        return (
          <View
            key={index}
            style={[
              styles.dot,
              isActive ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 16,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    width: 28,
    backgroundColor: COLORS.accent,
  },
  inactiveDot: {
    width: 8,
    backgroundColor: COLORS.border,
  },
});
