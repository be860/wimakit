export const COLORS = {
  primary: '#2E4E92',
  primaryDark: '#1D4180',
  accent: '#2B7A0B',
  accentBright: '#4CAF00',
  textSecondary: '#6B6D73',
  background: '#F4F6FA',
  surface: '#FFFFFF',
  border: '#E4E4E6',
  error: '#D32F2F',
  placeholderText: '#9E9E9E',
  iconGray: '#6B6D73',
  cardShadow: 'rgba(46, 78, 146, 0.08)',
};

export const RADIUS = {
  pill: 30,
  card: 16,
  image: 16,
};

export const FONTS = {
  headingBold: 'Outfit_700Bold',
  headingSemiBold: 'Outfit_600SemiBold',
  headingMedium: 'Outfit_500Medium',
  bodyRegular: 'Poppins_400Regular',
  bodyMedium: 'Poppins_500Medium',
  bodySemiBold: 'Poppins_600SemiBold',
  bodyBold: 'Poppins_700Bold',
};

// Backwards compatibility aliases for default Expo template components
export const Colors = {
  light: {
    text: '#11181C',
    background: '#F4F6FA',
    tint: COLORS.primary,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: COLORS.primary,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: COLORS.primary,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: COLORS.primary,
  },
};

export const Fonts = FONTS;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const MaxContentWidth = 1200;

export type ThemeColor = 'light' | 'dark';
