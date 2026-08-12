import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, FONTS } from '../constants/theme';
import { Logo } from '../components/common/Logo';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { PaginationDots } from '../components/common/PaginationDots';
import { useAuth } from '../context/auth-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SlideData {
  id: number;
  image: any;
  title: string;
  subtitle: string;
}

const SLIDES: SlideData[] = [
  {
    id: 1,
    image: require('../../assets/images/onboarding-1.jpg'),
    title: 'Buy Fresh Produce Directly From Verified Farmers',
    subtitle: 'Connect with local producers and get the best quality ingredients delivered to your door.',
  },
  {
    id: 2,
    image: require('../../assets/images/onboarding-2.jpg'),
    title: 'Verified Farmers. Transparent Prices.',
    subtitle: 'Access real-time market prices, direct farmer contact, and quality-assured harvests.',
  },
  {
    id: 3,
    image: require('../../assets/images/onboarding-3.png'),
    title: 'Order Securely. Track Easily.',
    subtitle: 'Pay securely via Mobile Money or Card. Track your fresh produce from the farm directly to your warehouse.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { setOnboardingCompleted } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / SCREEN_WIDTH);
    if (index >= 0 && index < SLIDES.length) {
      setActiveIndex(index);
    }
  };

  const goToNextSlide = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1 });
    }
  };

  const goToPrevSlide = () => {
    if (activeIndex > 0) {
      flatListRef.current?.scrollToIndex({ index: activeIndex - 1 });
    }
  };

  const finishOnboarding = async () => {
    await setOnboardingCompleted();
    router.replace('/(auth)/sign-up');
  };

  const skipOnboarding = async () => {
    await setOnboardingCompleted();
    router.replace('/(auth)/sign-in');
  };

  const renderSlide = ({ item }: { item: SlideData }) => (
    <View style={styles.slideContainer}>
      <View style={styles.imageCardWrapper}>
        <Image source={item.image} style={styles.slideImage} resizeMode="cover" />
      </View>

      <View style={styles.textSection}>
        <Text style={styles.headline}>{item.title}</Text>
        <Text style={styles.subtext}>{item.subtitle}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Logo size="sm" />
      </View>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        keyExtractor={(item) => item.id.toString()}
        style={styles.carousel}
      />

      <PaginationDots total={3} activeIndex={activeIndex} />

      {/* Slide 1 Bottom Controls */}
      {activeIndex === 0 && (
        <View style={styles.bottomControls}>
          <PrimaryButton
            label="Next"
            variant="primary"
            showArrow
            onPress={goToNextSlide}
            style={styles.fullWidthBtn}
          />
          <TouchableOpacity activeOpacity={0.7} onPress={skipOnboarding} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip Introduction</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Slide 2 Bottom Controls - Circular Corner Buttons */}
      {activeIndex === 1 && (
        <View style={styles.slide2Controls}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={goToPrevSlide}
            style={[styles.circleBtn, styles.circleBtnNavy]}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.surface} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={goToNextSlide}
            style={[styles.circleBtn, styles.circleBtnGreen]}
          >
            <Ionicons name="arrow-forward" size={24} color={COLORS.surface} />
          </TouchableOpacity>
        </View>
      )}

      {/* Slide 3 Bottom Controls - Full Width Green Button */}
      {activeIndex === 2 && (
        <View style={styles.bottomControls}>
          <PrimaryButton
            label="Get started"
            variant="accent"
            showArrow
            onPress={finishOnboarding}
            style={styles.fullWidthBtn}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 16,
  },
  carousel: {
    flex: 1,
  },
  slideContainer: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  imageCardWrapper: {
    width: '100%',
    height: SCREEN_WIDTH * 0.95,
    borderRadius: RADIUS.image,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    backgroundColor: '#F0F0F0',
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  textSection: {
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 12,
  },
  headline: {
    fontSize: 22,
    fontFamily: FONTS.headingBold,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 10,
  },
  subtext: {
    fontSize: 14,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomControls: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  fullWidthBtn: {
    width: '100%',
  },
  skipBtn: {
    marginTop: 14,
    paddingVertical: 6,
  },
  skipText: {
    fontSize: 14,
    fontFamily: FONTS.bodyBold,
    fontWeight: '700',
    color: COLORS.accent,
  },
  slide2Controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 32,
    width: '100%',
  },
  circleBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  circleBtnNavy: {
    backgroundColor: COLORS.primary,
  },
  circleBtnGreen: {
    backgroundColor: COLORS.accent,
  },
});
