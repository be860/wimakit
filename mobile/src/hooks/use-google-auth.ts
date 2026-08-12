import { useEffect, useRef } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

// Required once per app so the in-progress browser auth session is properly
// closed and control is handed back to the app after Google redirects.
WebBrowser.maybeCompleteAuthSession();

interface UseGoogleAuthOptions {
  /** Called with the Google ID token once the user completes sign-in. */
  onSuccess: (idToken: string) => void;
  /** Called if the user cancels or Google returns an error. */
  onError?: (message: string) => void;
}

/**
 * Wraps expo-auth-session's Google provider so both the sign-in and sign-up
 * screens can trigger the same OAuth flow and hand the resulting ID token to
 * the backend's POST /api/auth/google endpoint.
 *
 * Requires EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID (always) and, for native builds,
 * EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID / EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID.
 * See the Google Cloud Console setup steps in the project README.
 */
export function useGoogleAuth({ onSuccess, onError }: UseGoogleAuthOptions) {
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

  // Keep the latest callbacks without re-creating the auth request on every render.
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  onSuccessRef.current = onSuccess;
  onErrorRef.current = onError;

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId,
    androidClientId,
    iosClientId,
  });

  useEffect(() => {
    if (!response) return;

    if (response.type === 'success') {
      const idToken = response.params?.id_token;
      if (idToken) {
        onSuccessRef.current(idToken);
      } else {
        onErrorRef.current?.('Google did not return an ID token. Please try again.');
      }
    } else if (response.type === 'error') {
      onErrorRef.current?.(
        response.error?.message || 'Google sign-in failed. Please try again.'
      );
    }
    // 'cancel' / 'dismiss' are silent — the user simply closed the sheet.
  }, [response]);

  const isConfigured = Boolean(webClientId);

  const promptGoogleSignIn = async () => {
    if (!isConfigured) {
      onErrorRef.current?.(
        'Google sign-in is not configured for this build. Add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to your .env file.'
      );
      return;
    }
    await promptAsync();
  };

  return {
    /** True once Google's discovery document has loaded and the button is tappable. */
    isReady: Boolean(request),
    /** True if at least the web client ID env var is present. */
    isConfigured,
    promptGoogleSignIn,
  };
}
