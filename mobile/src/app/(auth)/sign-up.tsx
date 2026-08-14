import React, { useState, useRef } from 'react';
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
import { BUSINESS_TYPES, DISTRICTS } from '../../constants/buyer';
import { AuthCard } from '../../components/auth/AuthCard';
import { PillTextInput } from '../../components/common/PillTextInput';
import { PillSelectInput } from '../../components/common/PillSelectInput';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { GoogleLogo } from '../../components/common/GoogleLogo';
import { useAuth } from '../../context/auth-context';
import { useGoogleAuth } from '../../hooks/use-google-auth';

// Mirrors the backend's [RegularExpression] on FirstName / LastName. Validating
// locally keeps the user out of an ASP.NET ModelState 400 for a typo.
const NAME_PATTERN = /^[a-zA-Z\s'-]+$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function checkPassword(pwd: string) {
  return {
    length: pwd.length >= 6,
    uppercase: /[A-Z]/.test(pwd),
    lowercase: /[a-z]/.test(pwd),
    digit: /[0-9]/.test(pwd),
  };
}

function PasswordRule({ met, text }: { met: boolean; text: string }) {
  return (
    <View style={ruleStyles.row}>
      <Ionicons
        name={met ? 'checkmark-circle' : 'ellipse-outline'}
        size={14}
        color={met ? COLORS.accent : COLORS.textSecondary}
      />
      <Text style={[ruleStyles.text, met && ruleStyles.textMet]} allowFontScaling={false}>
        {text}
      </Text>
    </View>
  );
}

export default function SignUpScreen() {
  const router = useRouter();
  const { registerBuyer, googleSignIn } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [district, setDistrict] = useState('');
  const [password, setPassword] = useState('');
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
        setErrorMsg(
          err.data?.message || err.message || 'Google sign-up failed. Please try again.'
        );
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: (message) => {
      setGoogleLoading(false);
      setErrorMsg(message);
    },
  });

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
  };

  /** Returns the first validation failure, or null when the form is good to send. */
  const validate = (): string | null => {
    if (!firstName.trim()) return 'First name is required.';
    if (firstName.trim().length > 50) return 'First name cannot exceed 50 characters.';
    if (!NAME_PATTERN.test(firstName.trim()))
      return 'First name can only contain letters, spaces, hyphens, and apostrophes.';

    if (!lastName.trim()) return 'Last name is required.';
    if (lastName.trim().length > 50) return 'Last name cannot exceed 50 characters.';
    if (!NAME_PATTERN.test(lastName.trim()))
      return 'Last name can only contain letters, spaces, hyphens, and apostrophes.';

    if (!email.trim()) return 'Email address is required.';
    if (!EMAIL_PATTERN.test(email.trim())) return 'Please enter a valid email address.';
    if (email.trim().length > 100) return 'Email cannot exceed 100 characters.';

    if (phone.trim() && phone.trim().length > 20)
      return 'Phone number cannot exceed 20 characters.';

    if (!businessName.trim()) return 'Business / organization name is required.';
    if (businessName.trim().length > 100)
      return 'Business name cannot exceed 100 characters.';

    if (!businessType) return 'Please select a business type.';
    if (!district) return 'Please select your district.';

    const rules = checkPassword(password);
    if (!rules.length) return 'Password must be at least 6 characters.';
    if (password.length > 100) return 'Password cannot exceed 100 characters.';
    if (!rules.uppercase || !rules.lowercase || !rules.digit)
      return 'Password must include an uppercase letter, a lowercase letter, and a number.';

    return null;
  };

  const handleSignUp = async () => {
    setErrorMsg(null);

    const validationError = validate();
    if (validationError) {
      setErrorMsg(validationError);
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
        businessName: businessName.trim(),
        businessType,
        location: district,
      });

      setLoading(false);

      // The backend still reports success when the OTP email fails to send, and
      // that message is the only warning the user will get.
      router.push({
        pathname: '/(auth)/verify-otp',
        params: { email: res.email || email.trim(), notice: res.message ?? '' },
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
            label="Business / Organization Name"
            placeholder="e.g. Kamara Fresh Foods"
            leadingIcon="business-outline"
            maxLength={100}
            value={businessName}
            onChangeText={setBusinessName}
            returnKeyType="next"
            onFocus={scrollToBottom}
          />

          <PillSelectInput
            label="Business Type"
            placeholder="Select your business type"
            leadingIcon="briefcase-outline"
            value={businessType}
            options={BUSINESS_TYPES}
            onSelect={setBusinessType}
            modalTitle="Business Type"
          />

          <PillSelectInput
            label="District"
            placeholder="Select your district"
            leadingIcon="location-outline"
            value={district}
            options={DISTRICTS}
            onSelect={setDistrict}
            modalTitle="District"
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

          {/* Inline password strength rules — appear as user types */}
          {password.length > 0 && (() => {
            const rules = checkPassword(password);
            return (
              <View style={styles.rulesBox}>
                <PasswordRule met={rules.length} text="At least 6 characters" />
                <PasswordRule met={rules.uppercase} text="One uppercase letter (A–Z)" />
                <PasswordRule met={rules.lowercase} text="One lowercase letter (a–z)" />
                <PasswordRule met={rules.digit} text="One number (0–9)" />
              </View>
            );
          })()}

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
            loading={googleLoading}
            disabled={!googleReady || googleLoading}
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
});

const ruleStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  text: {
    fontSize: 12,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
  },
  textMet: {
    color: COLORS.accent,
    fontFamily: FONTS.bodyMedium,
  },
});

