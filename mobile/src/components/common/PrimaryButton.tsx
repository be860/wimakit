import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, FONTS } from '../../constants/theme';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'accent' | 'outline' | 'google';
  loading?: boolean;
  disabled?: boolean;
  showArrow?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export function PrimaryButton({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  showArrow = true,
  style,
  textStyle,
  icon,
}: PrimaryButtonProps) {
  const isOutline = variant === 'outline' || variant === 'google';
  const isAccent = variant === 'accent';

  const buttonBackgroundColor = disabled
    ? '#BDC3C7'
    : isOutline
    ? COLORS.surface
    : isAccent
    ? COLORS.accent
    : COLORS.primary;

  const textColor = isOutline ? '#333333' : COLORS.surface;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        { backgroundColor: buttonBackgroundColor },
        isOutline && styles.outlineBorder,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[styles.text, { color: textColor }, textStyle]}>{label}</Text>
          {showArrow && !icon && (
            <Ionicons name="arrow-forward" size={20} color={textColor} style={styles.arrowIcon} />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: RADIUS.pill,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 24,
  },
  outlineBorder: {
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 10,
  },
  text: {
    fontSize: 16,
    fontFamily: FONTS.bodyBold,
    fontWeight: '700',
    textAlign: 'center',
  },
  arrowIcon: {
    marginLeft: 8,
  },
});
