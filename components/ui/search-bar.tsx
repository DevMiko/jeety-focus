import { Colors, FontSize, Radius } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  rightIcon?: React.ReactNode;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Rechercher...',
  rightIcon,
}: SearchBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.gray400}
          returnKeyType="search"
        />
      </View>
      {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchIcon: {
    fontSize: 14,
  },
  input: {
    flex: 1,
    fontSize: FontSize.lg,
    color: Colors.gray800,
    padding: 0,
  },
  rightIcon: {},
});
