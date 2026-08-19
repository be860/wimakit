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
        source={
          isSm
            ? require('../../../assets/images/wimakit-logo-horizontal.png')
            : require('../../../assets/images/wimakit-logo-stacked.png')
        }
        style={isSm ? styles.logoImageSm : styles.logoImageLg}
        resizeMode="contain"
      />
    </View>
  );
}

// Each box matches its asset's aspect ratio. `resizeMode="contain"` fits the
// image inside the box, so a mismatched box silently shrinks the logo — the
// portrait stacked mark (280x313) rendered at only ~45x50 inside a 145x50 box.
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // wimakit-logo-horizontal.png — 420x117
  logoImageSm: {
    width: 145,
    height: 40,
  },
  // wimakit-logo-stacked.png — 280x313
  logoImageLg: {
    width: 150,
    height: 168,
  },
});
