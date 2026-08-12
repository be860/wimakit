import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../constants/theme';
import { Logo } from '../components/common/Logo';
import { useAuth } from '../context/auth-context';

export default function SplashScreen() {
  const router = useRouter();
  const { user, token, isLoading, hasCompletedOnboarding } = useAuth();

  const spinAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Rotation animation for sync icon
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1400,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Progress bar animation from left to right over 2 seconds
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [spinAnim, progressAnim]);

  useEffect(() => {
    if (isLoading) return;

    const timer = setTimeout(() => {
      if (token && user) {
        router.replace('/(tabs)');
      } else if (hasCompletedOnboarding) {
        router.replace('/(auth)/sign-in');
      } else {
        router.replace('/onboarding');
      }
    }, 2400);

    return () => clearTimeout(timer);
  }, [isLoading, token, user, hasCompletedOnboarding, router]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Logo size="lg" />
      </View>

      <View style={styles.bottomSection}>
        <View style={styles.syncWrapper}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Ionicons name="sync-outline" size={28} color={COLORS.primary} />
          </Animated.View>
          <Text style={styles.initializingText} allowFontScaling={false}>
            INITIALIZING PLATFORM
          </Text>
        </View>

        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSection: {
    width: '100%',
    maxWidth: 270,
    alignItems: 'center',
    marginBottom: 64,
  },
  syncWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 18,
  },
  initializingText: {
    fontSize: 12,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
    color: COLORS.primary,
    letterSpacing: 2,
  },
  progressTrack: {
    width: '100%',
    height: 5,
    backgroundColor: '#E8ECF4',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
});
