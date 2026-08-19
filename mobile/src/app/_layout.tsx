import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import Toast from 'react-native-toast-message';
import {
  useFonts,
  Outfit_700Bold,
  Outfit_600SemiBold,
  Outfit_500Medium,
} from '@expo-google-fonts/outfit';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { AuthProvider } from '../context/auth-context';
import { FavoritesProvider } from '../context/favorites-context';
import { CartProvider } from '../context/cart-context';
import { ChatProvider } from '../context/chat-context';
import { COLORS } from '../constants/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Outfit_700Bold,
    Outfit_600SemiBold,
    Outfit_500Medium,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AuthProvider>
      <FavoritesProvider>
        <CartProvider>
          <ChatProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: COLORS.background },
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="onboarding" />
              <Stack.Screen name="oauthredirect" />
              <Stack.Screen name="notifications" options={{ presentation: 'card' }} />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
            </Stack>
            <Toast />
          </ChatProvider>
        </CartProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
}
