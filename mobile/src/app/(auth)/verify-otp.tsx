import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { COLORS, FONTS } from '../../constants/theme';
import { AuthCard } from '../../components/auth/AuthCard';
import { OtpInput } from '../../components/auth/OtpInput';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { useAuth } from '../../context/auth-context';
import { getErrorMessage } from '../../services/api-client';

export default function VerifyOtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string; notice?: string }>();
  const emailParam = params.email || '';

  const { verifyOtp, resendOtp } = useAuth();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(params.notice || null);

  // OtpInput auto-submits on the 6th digit while the Verify button stays live,
  // so without this a single code can fire two requests at a 10/min limiter.
  const submittingRef = useRef(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async (codeToVerify?: string) => {
    if (submittingRef.current) return;

    const finalOtp = codeToVerify || otp;
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!emailParam) {
      setErrorMsg('Email address missing. Please try signing up again.');
      return;
    }
    if (!/^\d{6}$/.test(finalOtp)) {
      setErrorMsg('Please enter a valid 6-digit OTP code.');
      return;
    }

    submittingRef.current = true;
    setLoading(true);

    try {
      await verifyOtp(emailParam, finalOtp);
      // `dashboard` is a hidden alias route (href: null), so landing there
      // leaves the tab bar with nothing selected.
      router.replace('/(tabs)');
    } catch (err: any) {
      const msg = getErrorMessage(err, 'Verification failed. Invalid or expired OTP code.');
      setErrorMsg(msg);
      Toast.show({ type: 'error', text1: 'Verification failed', text2: msg });
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || resending) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    if (!emailParam) {
      setErrorMsg('Email address missing. Please try signing up again.');
      return;
    }

    setResending(true);

    try {
      const msg = await resendOtp(emailParam);
      setResending(false);
      setTimer(60);
      setSuccessMsg(msg);
      Toast.show({ type: 'success', text1: 'OTP resent', text2: msg });
    } catch (err: any) {
      setResending(false);
      const msg = getErrorMessage(err, 'Could not resend OTP code. Please try again.');
      setErrorMsg(msg);
      Toast.show({ type: 'error', text1: 'Could not resend OTP', text2: msg });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AuthCard
          title="Verify Email"
          subtitle={`We sent a 6-digit code to ${emailParam || 'your email'}`}
          footerText="Wrong email address?"
          footerActionText="Back to Sign Up"
          onFooterAction={() => router.push('/(auth)/sign-up')}
        >
          {errorMsg ? (
            <View style={styles.errorAlert}>
              <Ionicons name="alert-circle" size={18} color={COLORS.error} />
              <Text style={styles.errorAlertText}>{errorMsg}</Text>
            </View>
          ) : null}

          {successMsg ? (
            <View style={styles.successAlert}>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.accent} />
              <Text style={styles.successAlertText}>{successMsg}</Text>
            </View>
          ) : null}

          <OtpInput
            length={6}
            onCodeChanged={setOtp}
            onCodeFilled={(code) => {
              setOtp(code);
              handleVerify(code);
            }}
          />

          <View style={styles.resendRow}>
            <Text style={styles.resendLabel}>Didn't receive code?</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleResend}
              disabled={timer > 0 || resending}
            >
              <Text
                style={[
                  styles.resendLink,
                  timer > 0 ? styles.resendDisabled : null,
                ]}
              >
                {timer > 0 ? `Resend Code (${timer}s)` : 'Resend Code'}
              </Text>
            </TouchableOpacity>
          </View>

          <PrimaryButton
            label="Verify"
            variant="primary"
            showArrow={false}
            loading={loading}
            onPress={() => handleVerify()}
            style={styles.verifyBtn}
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
    paddingVertical: 32,
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
  successAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderColor: '#A5D6A7',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    gap: 8,
  },
  successAlertText: {
    flex: 1,
    fontSize: 13,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.accent,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    gap: 6,
  },
  resendLabel: {
    fontSize: 13,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
  },
  resendLink: {
    fontSize: 13,
    fontFamily: FONTS.bodyBold,
    fontWeight: '700',
    color: COLORS.accent,
  },
  resendDisabled: {
    color: '#A0A0A0',
  },
  verifyBtn: {
    marginTop: 4,
  },
});
