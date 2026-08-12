import React from 'react';
import { Image, StyleSheet } from 'react-native';

interface GoogleLogoProps {
  size?: number;
}

export function GoogleLogo({ size = 20 }: GoogleLogoProps) {
  return (
    <Image
      source={require('../../../assets/images/google-logo.png')}
      style={[styles.logo, { width: size, height: size }]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    marginRight: 4,
  },
});
