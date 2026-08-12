import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, RADIUS, FONTS } from '../../constants/theme';
import { Logo } from '../common/Logo';

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footerText?: string;
  footerActionText?: string;
  onFooterAction?: () => void;
}

export function AuthCard({
  title,
  subtitle,
  children,
  footerText,
  footerActionText,
  onFooterAction,
}: AuthCardProps) {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardContent}>
        <View style={styles.logoWrapper}>
          <Logo size="sm" />
        </View>

        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

        <View style={styles.formContainer}>{children}</View>
      </View>

      {footerText && footerActionText ? (
        <View style={styles.footerBar}>
          <Text style={styles.footerText}>{footerText} </Text>
          <TouchableOpacity activeOpacity={0.7} onPress={onFooterAction}>
            <Text style={styles.footerActionText}>{footerActionText}</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#2E4E92',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  cardContent: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    alignItems: 'center',
  },
  logoWrapper: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.headingBold,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  formContainer: {
    width: '100%',
  },
  footerBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F2F7',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 14,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
  },
  footerActionText: {
    fontSize: 14,
    fontFamily: FONTS.bodyBold,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
