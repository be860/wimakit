import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../../constants/theme';
import { AuthCard } from '../../components/auth/AuthCard';
import { PillTextInput } from '../../components/common/PillTextInput';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { apiClient } from '../../services/api-client';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSendOtp = async () => {
    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await apiClient.post('/api/auth/forgot-password', { email: email.trim() });
      setSuccessMsg('A password reset code has been sent to your email. Check your inbox.');
      setLoading(false);

      // Navigate to reset screen after short delay
      setTimeout(() => {
        router.push({
          pathname: '/(auth)/reset-password' as any,
          params: { email: email.trim() },
        });
      }, 1500);
    } catch (err: any) {
      setLoading(false);
      const msg =
        err.data?.message ||
        err.message ||
        'Could not send reset code. Please check your email and try again.';
      setErrorMsg(msg);
    }
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
        showsVerticalScrollIndicator={false}
      >
        <AuthCard
          title="Forgot Password"
          subtitle="We'll send a reset code to your email address"
          footerText="Remembered your password?"
          footerActionText="Sign In"
          onFooterAction={() => router.back()}
        >
          {errorMsg ? (
            <View style={styles.errorAlert}>
              <Ionicons name="alert-circle" size={18} color={COLORS.error} />
              <Text style={styles.alertText} allowFontScaling={false}>
                {errorMsg}
              </Text>
            </View>
          ) : null}

          {successMsg ? (
            <View style={styles.successAlert}>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.accent} />
              <Text style={[styles.alertText, styles.successText]} allowFontScaling={false}>
                {successMsg}
              </Text>
            </View>
          ) : null}

          <PillTextInput
            label="Email Address"
            placeholder="you@example.com"
            leadingIcon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            returnKeyType="done"
          />

          <PrimaryButton
            label="Send Reset Code"
            variant="primary"
            showArrow={false}
            loading={loading}
            onPress={handleSendOtp}
            style={styles.btn}
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
  successAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF3E4',
    borderColor: '#A7D997',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    gap: 8,
  },
  alertText: {
    flex: 1,
    fontSize: 13,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.error,
  },
  successText: {
    color: COLORS.accent,
  },
  btn: {
    marginTop: 8,
    marginBottom: 8,
  },
});
