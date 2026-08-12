import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

interface LogoProps {
  size?: 'sm' | 'lg';
}

export function Logo({ size = 'sm' }: LogoProps) {
  const isSm = size === 'sm';

  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/images/wimakit-logo-stacked.png')}
        style={isSm ? styles.logoImageSm : styles.logoImageLg}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImageSm: {
    width: 145,
    height: 50,
  },
  logoImageLg: {
    width: 250,
    height: 90,
  },
});
