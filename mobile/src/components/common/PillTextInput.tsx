import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, FONTS } from '../../constants/theme';

interface PillTextInputProps extends TextInputProps {
  label?: string;
  labelRightAction?: React.ReactNode;
  leadingIcon?: keyof typeof Ionicons.glyphMap;
  isPassword?: boolean;
  error?: string;
}

export function PillTextInput({
  label,
  labelRightAction,
  leadingIcon,
  isPassword = false,
  error,
  style,
  ...props
}: PillTextInputProps) {
  const [secureTextEntry, setSecureTextEntry] = useState(isPassword);

  return (
    <View style={styles.container}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={styles.label} allowFontScaling={false}>{label}</Text>
          {labelRightAction}
        </View>
      ) : null}

      <View style={[styles.inputWrapper, error ? styles.inputErrorBorder : null]}>
        {leadingIcon && (
          <Ionicons
            name={leadingIcon}
            size={20}
            color={COLORS.textSecondary}
            style={styles.leadingIcon}
          />
        )}

        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={COLORS.placeholderText}
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
          allowFontScaling={false}
          {...props}
        />

        {isPassword && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setSecureTextEntry(!secureTextEntry)}
            style={styles.eyeToggle}
          >
            <Ionicons
              name={secureTextEntry ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontFamily: FONTS.bodyMedium,
    fontWeight: '500',
    color: '#333333',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
  },
  inputErrorBorder: {
    borderColor: COLORS.error,
  },
  leadingIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    fontSize: 13.5,
    fontFamily: FONTS.bodyRegular,
    color: '#222222',
  },
  eyeToggle: {
    padding: 6,
  },
  errorText: {
    fontSize: 12,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.error,
    marginTop: 4,
    marginLeft: 12,
  },
});
