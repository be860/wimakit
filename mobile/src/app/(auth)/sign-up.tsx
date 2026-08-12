import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../../constants/theme';
import { AuthCard } from '../../components/auth/AuthCard';
import { PillTextInput } from '../../components/common/PillTextInput';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { GoogleLogo } from '../../components/common/GoogleLogo';
import { useAuth } from '../../context/auth-context';

export default function SignUpScreen() {
  const router = useRouter();
  const { registerBuyer } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
  };

  const handleSignUp = async () => {
    setErrorMsg(null);

    if (!firstName.trim()) {
      setErrorMsg('First name is required.');
      return;
    }
    if (!lastName.trim()) {
      setErrorMsg('Last name is required.');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Email address is required.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await registerBuyer({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
      });

      setLoading(false);

      // Navigate to verify OTP with email parameter
      router.push({
        pathname: '/(auth)/verify-otp',
        params: { email: email.trim() },
      });
    } catch (err: any) {
      setLoading(false);
      const msg =
        err.data?.message ||
        err.message ||
        'Registration failed. Please check your details.';
      setErrorMsg(msg);
    }
  };

  const handleGoogleSignUp = async () => {
    Alert.alert(
      'Google Sign Up',
      'Connecting to Google authentication service...'
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 20}
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets
      >
        <AuthCard
          title="Create Account"
          subtitle="Join WiMakit to buy fresh produce directly"
          footerText="Already have an account?"
          footerActionText="Sign In"
          onFooterAction={() => router.push('/(auth)/sign-in')}
        >
          {errorMsg ? (
            <View style={styles.errorAlert}>
              <Ionicons name="alert-circle" size={18} color={COLORS.error} />
              <Text style={styles.errorAlertText} allowFontScaling={false}>
                {errorMsg}
              </Text>
            </View>
          ) : null}

          <View style={styles.nameRow}>
            <View style={styles.flexField}>
              <PillTextInput
                label="First Name"
                placeholder="Mohamed"
                leadingIcon="person-outline"
                value={firstName}
                onChangeText={setFirstName}
                returnKeyType="next"
              />
            </View>
            <View style={styles.flexField}>
              <PillTextInput
                label="Last Name"
                placeholder="Kamara"
                leadingIcon="person-outline"
                value={lastName}
                onChangeText={setLastName}
                returnKeyType="next"
              />
            </View>
          </View>

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

          <PillTextInput
            label="Phone Number (Optional)"
            placeholder="+232 76 123 456"
            leadingIcon="call-outline"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            returnKeyType="next"
            onFocus={scrollToBottom}
          />

          <PillTextInput
            label="Password"
            placeholder="At least 6 characters"
            leadingIcon="lock-closed-outline"
            isPassword
            value={password}
            onChangeText={setPassword}
            returnKeyType="done"
            onFocus={scrollToBottom}
          />

          {/* Full-width Navy Register Button */}
          <PrimaryButton
            label="Register"
            variant="primary"
            showArrow={false}
            loading={loading}
            onPress={handleSignUp}
            style={styles.registerBtn}
          />

          {/* OR CONTINUE WITH Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText} allowFontScaling={false}>
              OR CONTINUE WITH
            </Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Sign Up Button */}
          <PrimaryButton
            label="Google"
            variant="google"
            showArrow={false}
            onPress={handleGoogleSignUp}
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
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  flexField: {
    flex: 1,
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
  registerBtn: {
    marginTop: 8,
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
