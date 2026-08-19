import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/auth-context';

// Google's OAuth redirect (wimakit(.shop)://oauthredirect) lands here because
// expo-router treats every incoming URL matching the app's scheme as a
// navigation target — without a route at this exact path it fell through to
// the "Unmatched Route" screen instead of letting sign-in finish processing
// the auth result. Reads auth state directly (rather than bouncing through
// "/", which is the splash screen and replays its animation + artificial
// delay) so this settles on the dashboard the instant googleSignIn resolves.
export default function OAuthRedirectScreen() {
  const router = useRouter();
  const { user, token, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    router.replace(token && user ? '/(tabs)' : '/(auth)/sign-in');
  }, [isLoading, token, user, router]);

  return null;
}
