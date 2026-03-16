import { FontSize, FontWeight, Radius } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface InfoBoxProps {
  children?: React.ReactNode;
  /** Shorthand — renders a plain Text node instead of children */
  text?: string;
  variant?: 'info' | 'warning' | 'success';
  icon?: string;
}

const config = {
  info: { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8', icon: 'ℹ️' },
  warning: { bg: '#fffbeb', border: '#fde68a', text: '#92400e', icon: '⚠️' },
  success: { bg: '#f0fdf4', border: '#bbf7d0', text: '#065f46', icon: '✓' },
};

export function InfoBox({ children, text, variant = 'info', icon }: InfoBoxProps) {
  const c = config[variant];
  return (
    <View style={[styles.container, { backgroundColor: c.bg, borderColor: c.border }]}>
      <Text style={[styles.icon]}>{icon ?? c.icon}</Text>
      <Text style={[styles.text, { color: c.text }]}>{text ?? children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: 12,
  },
  icon: {
    fontSize: 14,
  },
  text: {
    flex: 1,
    fontSize: FontSize.md,
    lineHeight: 18,
    fontWeight: FontWeight.medium,
  },
});
