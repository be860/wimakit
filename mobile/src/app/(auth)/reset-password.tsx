import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { COLORS, FONTS } from '../../constants/theme';
import { AuthCard } from '../../components/auth/AuthCard';
import { PillTextInput } from '../../components/common/PillTextInput';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { apiClient, getErrorMessage } from '../../services/api-client';

/** Password rule checker */
function checkPassword(pwd: string) {
  return {
    length: pwd.length >= 6,
    uppercase: /[A-Z]/.test(pwd),
    lowercase: /[a-z]/.test(pwd),
    digit: /[0-9]/.test(pwd),
  };
}

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const scrollRef = useRef<ScrollView>(null);

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const rules = checkPassword(newPassword);
  const allRulesPass = rules.length && rules.uppercase && rules.lowercase && rules.digit;

  const handleReset = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!otp.trim()) {
      setErrorMsg('Please enter the 6-digit code sent to your email.');
      return;
    }
    if (!allRulesPass) {
      setErrorMsg('Password does not meet the requirements shown below.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await apiClient.post('/api/auth/reset-password', {
        email: email?.trim() || '',
        otp: otp.trim(),
        newPassword,
      });

      setSuccessMsg('Password reset successfully! You can now sign in.');
      setLoading(false);
      Toast.show({
        type: 'success',
        text1: 'Password reset',
        text2: 'You can now sign in with your new password.',
      });

      setTimeout(() => {
        router.replace('/(auth)/sign-in');
      }, 2000);
    } catch (err: any) {
      setLoading(false);
      const msg = getErrorMessage(err, 'Reset failed. Please check your code and try again.');
      setErrorMsg(msg);
      Toast.show({ type: 'error', text1: 'Could not reset password', text2: msg });
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 20}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AuthCard
          title="Reset Password"
          subtitle={`Enter the code sent to ${email || 'your email'}`}
          footerText="Didn't get a code?"
          footerActionText="Go Back"
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
            label="Reset Code (OTP)"
            placeholder="6-digit code"
            leadingIcon="key-outline"
            keyboardType="number-pad"
            value={otp}
            onChangeText={setOtp}
            returnKeyType="next"
          />

          <PillTextInput
            label="New Password"
            placeholder="New password"
            leadingIcon="lock-closed-outline"
            isPassword
            value={newPassword}
            onChangeText={setNewPassword}
            returnKeyType="next"
            onFocus={scrollToBottom}
          />

          {/* Inline password strength rules */}
          {newPassword.length > 0 && (
            <View style={styles.rulesBox}>
              <PasswordRule met={rules.length} text="At least 6 characters" />
              <PasswordRule met={rules.uppercase} text="One uppercase letter (A-Z)" />
              <PasswordRule met={rules.lowercase} text="One lowercase letter (a-z)" />
              <PasswordRule met={rules.digit} text="One number (0-9)" />
            </View>
          )}

          <PillTextInput
            label="Confirm New Password"
            placeholder="Repeat new password"
            leadingIcon="lock-closed-outline"
            isPassword
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            returnKeyType="done"
            onFocus={scrollToBottom}
          />

          <PrimaryButton
            label="Reset Password"
            variant="primary"
            showArrow={false}
            loading={loading}
            onPress={handleReset}
            style={styles.btn}
          />
        </AuthCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function PasswordRule({ met, text }: { met: boolean; text: string }) {
  return (
    <View style={styles.ruleRow}>
      <Ionicons
        name={met ? 'checkmark-circle' : 'ellipse-outline'}
        size={14}
        color={met ? COLORS.accent : COLORS.textSecondary}
      />
      <Text
        style={[styles.ruleText, met && styles.ruleTextMet]}
        allowFontScaling={false}
      >
        {text}
      </Text>
    </View>
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
  rulesBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: -8,
    marginBottom: 14,
    gap: 5,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  ruleText: {
    fontSize: 12,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
  },
  ruleTextMet: {
    color: COLORS.accent,
    fontFamily: FONTS.bodyMedium,
  },
  btn: {
    marginTop: 8,
    marginBottom: 8,
  },
});
