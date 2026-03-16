import { Colors, FontWeight, Radius } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface AvatarProps {
  initials: string;
  size?: number;
  backgroundColor?: string;
  borderRadius?: number;
  textColor?: string;
}

export function Avatar({
  initials,
  size = 32,
  backgroundColor = Colors.pink,
  borderRadius = Radius.lg,
  textColor = Colors.white,
}: AvatarProps) {
  const fontSize = Math.floor(size * 0.34);
  return (
    <View
      style={[
        styles.base,
        { width: size, height: size, borderRadius, backgroundColor },
      ]}
    >
      <Text style={[styles.text, { fontSize, color: textColor }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
  },
});
