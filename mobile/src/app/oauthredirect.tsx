import { useEffect } from 'react';
import { useRouter } from 'expo-router';

// Google's OAuth redirect (wimakit(.shop)://oauthredirect) lands here because
// expo-router treats every incoming URL matching the app's scheme as a
// navigation target — without a route at this exact path it fell through to
// the "Unmatched Route" screen.
//
// The sign-in/sign-up screen that started the flow is still mounted
// underneath, mid-`await promptAsync()`, and is what actually finishes the
// token exchange and decides where to go next (dashboard on success, inline
// error on failure). Deciding that *here too* — based on auth state at this
// screen's mount time — used to race that in-flight exchange: this screen
// would see no token yet and redirect to sign-in, mounting a second fresh
// instance and briefly showing the sign-in screen twice before the original
// instance's own redirect to the dashboard finally landed. Simply going back
// hands control straight back to that original instance instead, so there's
// only ever one navigation decision, made once the exchange actually settles.
export default function OAuthRedirectScreen() {
  const router = useRouter();

  useEffect(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }, [router]);

  return null;
}
