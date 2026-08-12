import React, { useRef, useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../../constants/theme';

interface OtpInputProps {
  length?: number;
  onCodeChanged?: (code: string) => void;
  onCodeFilled?: (code: string) => void;
}

export function OtpInput({
  length = 6,
  onCodeChanged,
  onCodeFilled,
}: OtpInputProps) {
  const [code, setCode] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleChangeText = (text: string, index: number) => {
    const cleanText = text.replace(/[^0-9]/g, '');

    // If pasted full 6-digit OTP
    if (cleanText.length === length) {
      const newCode = cleanText.split('');
      setCode(newCode);
      const fullCode = newCode.join('');
      onCodeChanged?.(fullCode);
      onCodeFilled?.(fullCode);
      inputRefs.current[length - 1]?.focus();
      return;
    }

    const newCode = [...code];
    newCode[index] = cleanText.slice(-1);
    setCode(newCode);

    const fullCode = newCode.join('');
    onCodeChanged?.(fullCode);

    if (cleanText && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every((digit) => digit !== '') && newCode.length === length) {
      onCodeFilled?.(fullCode);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            inputRefs.current[index] = ref;
          }}
          style={[
            styles.box,
            code[index] ? styles.boxFilled : null,
          ]}
          keyboardType="number-pad"
          maxLength={index === 0 ? length : 1}
          value={code[index]}
          onChangeText={(text) => handleChangeText(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          selectTextOnFocus
          textAlign="center"
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginVertical: 20,
  },
  box: {
    width: 44,
    height: 52,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    fontSize: 20,
    fontFamily: FONTS.headingBold,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
  },
  boxFilled: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0F4FC',
  },
});
