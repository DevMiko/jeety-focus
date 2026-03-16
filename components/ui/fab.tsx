import { Colors, Shadows } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface FabProps {
  onPress: () => void;
  icon?: string;
}

export function Fab({ onPress, icon = '+' }: FabProps) {
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.85}>
      <Text style={styles.icon}>{icon}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 14,
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.lg,
    zIndex: 50,
  },
  icon: {
    color: Colors.white,
    fontSize: 26,
    fontWeight: '300',
    lineHeight: 30,
    marginTop: -2,
  },
});
