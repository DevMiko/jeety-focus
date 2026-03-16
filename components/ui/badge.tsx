import type { DossierType } from '@/constants/mock-data';
import { Colors, FontSize, FontWeight, Radius } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface BadgeProps {
  type: DossierType;
}

const config: Record<DossierType, { bg: string; text: string; label: string }> = {
  PAC:       { bg: Colors.pacBg,       text: Colors.pacText,       label: 'PAC' },
  BALLON:    { bg: Colors.ballonBg,    text: Colors.ballonText,    label: 'BALLON' },
  ISOLATION: { bg: Colors.isolationBg, text: Colors.isolationText, label: 'ISOLATION' },
  CHAUDIERE: { bg: Colors.chaudiereBg, text: Colors.chaudiereText, label: 'CHAUDIÈRE' },
};

export function TypeBadge({ type }: BadgeProps) {
  const c = config[type];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.text, { color: c.text }]}>{c.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.xs,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.extrabold,
    letterSpacing: 0.3,
  },
});
