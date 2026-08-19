import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { COLORS, FONTS } from '../../constants/theme';
import { AuthCard } from '../../components/auth/AuthCard';
import { PillTextInput } from '../../components/common/PillTextInput';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { useAuth } from '../../context/auth-context';
import { GoogleLogo } from '../../components/common/GoogleLogo';
import { useGoogleAuth } from '../../hooks/use-google-auth';
import { getErrorMessage } from '../../services/api-client';

export default function SignInScreen() {
  const router = useRouter();
  const { login, googleSignIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { isReady: googleReady, promptGoogleSignIn } = useGoogleAuth({
    onSuccess: async (idToken) => {
      setGoogleLoading(true);
      try {
        await googleSignIn(idToken);
        router.replace('/(tabs)');
      } catch (err: any) {
        const msg = getErrorMessage(err, 'Google sign-in failed. Please try again.');
        setErrorMsg(msg);
        Toast.show({ type: 'error', text1: 'Google sign-in failed', text2: msg });
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: (message) => {
      setGoogleLoading(false);
      setErrorMsg(message);
    },
  });

  const handleSignIn = async () => {
    setErrorMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    setLoading(true);

    try {
      await login(email.trim(), password);
      setLoading(false);
      router.replace('/(tabs)');
    } catch (err: any) {
      setLoading(false);
      const msg = getErrorMessage(err, 'Invalid email or password. Please try again.');
      setErrorMsg(msg);
      Toast.show({ type: 'error', text1: 'Sign-in failed', text2: msg });
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    await promptGoogleSignIn();
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets
      >
        <AuthCard
          title="Sign In"
          subtitle="Welcome back to WiMakit"
          footerText="Don't have an account?"
          footerActionText="Register"
          onFooterAction={() => router.push('/(auth)/sign-up')}
        >
          {errorMsg ? (
            <View style={styles.errorAlert}>
              <Ionicons name="alert-circle" size={18} color={COLORS.error} />
              <Text style={styles.errorAlertText} allowFontScaling={false}>
                {errorMsg}
              </Text>
            </View>
          ) : null}

          {/* Email Input */}
          <PillTextInput
            label="Email Address"
            placeholder="you@example.com"
            leadingIcon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            returnKeyType="next"
          />

          {/* Password Input */}
          <PillTextInput
            label="Password"
            placeholder="••••••••"
            leadingIcon="lock-closed-outline"
            isPassword
            value={password}
            onChangeText={setPassword}
            returnKeyType="done"
          />

          {/* Remember Me & Forgot Password Row */}
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              activeOpacity={0.7}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View
                style={[
                  styles.checkbox,
                  rememberMe && styles.checkboxChecked,
                ]}
              >
                {rememberMe && (
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                )}
              </View>
              <Text style={styles.rememberText} allowFontScaling={false}>
                Remember me
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/(auth)/forgot-password' as any)}
            >
              <Text style={styles.forgotText} allowFontScaling={false}>
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sign In Button */}
          <PrimaryButton
            label="Sign In"
            variant="primary"
            showArrow={false}
            loading={loading}
            onPress={handleSignIn}
            style={styles.signInBtn}
          />

          {/* OR CONTINUE WITH Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText} allowFontScaling={false}>
              OR CONTINUE WITH
            </Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Button */}
          <PrimaryButton
            label="Google"
            variant="google"
            showArrow={false}
            loading={googleLoading}
            disabled={!googleReady || googleLoading}
            onPress={handleGoogleSignIn}
            icon={<GoogleLogo size={22} />}
          />
        </AuthCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 36,
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDE8E8',
    borderColor: '#F8B4B4',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    gap: 8,
  },
  errorAlertText: {
    flex: 1,
    fontSize: 13,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.error,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  rememberText: {
    fontSize: 12.5,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
  },
  forgotText: {
    fontSize: 12.5,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.primary,
  },
  signInBtn: {
    marginBottom: 20,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: 11,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textSecondary,
    paddingHorizontal: 12,
    letterSpacing: 0.8,
  },
});
