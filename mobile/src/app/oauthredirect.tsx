import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/auth-context';

// Google's OAuth redirect (wimakit(.shop)://oauthredirect) lands here because
// expo-router treats every incoming URL matching the app's scheme as a
// navigation target — without a route at this exact path it fell through to
// the "Unmatched Route" screen.
//
// The sign-in/sign-up screen that started the flow is usually still mounted
// underneath, mid-`await promptAsync()`, and is what actually finishes the
// token exchange and decides where to go next (dashboard on success, inline
// error on failure). Going back to it is preferred: deciding the destination
// *here too* based on auth state at mount time used to race that in-flight
// exchange, briefly showing the sign-in screen a second time before the
// original instance's own redirect finally landed.
//
// But going back isn't always possible — if the app's process got reclaimed
// while the Google browser/account-picker had focus, the in-app navigation
// stack is gone by the time control returns, so router.canGoBack() is false.
// That used to fall through to "/", the splash screen, which is what caused
// the occasional glitch back to it. Now the fallback checks auth state
// directly and goes straight to the dashboard or sign-in — it never
// navigates to "/" from here.
export default function OAuthRedirectScreen() {
  const router = useRouter();
  const { user, token, isLoading } = useAuth();

  useEffect(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    if (isLoading) return;
    router.replace(token && user ? '/(tabs)' : '/(auth)/sign-in');
  }, [router, isLoading, token, user]);

  return null;
}
