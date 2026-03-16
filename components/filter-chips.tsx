import { Colors, FontSize, FontWeight, Radius } from '@/constants/theme';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface FilterOption {
  value: string;
  label: string;
}

interface FilterGroupProps {
  label: string;
  options: FilterOption[];
  activeValue: string;
  onSelect: (value: string) => void;
  activeColor?: string;
}

export function FilterGroup({
  label,
  options,
  activeValue,
  onSelect,
  activeColor = Colors.blue,
}: FilterGroupProps) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupLabel}>{label}</Text>
      <View style={styles.chips}>
        {options.map((opt) => {
          const isActive = activeValue === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.chip,
                isActive && { backgroundColor: activeColor, borderColor: activeColor },
              ]}
              onPress={() => onSelect(opt.value)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

interface FiltersBarProps {
  children: React.ReactNode;
}

export function FiltersBar({ children }: FiltersBarProps) {
  return (
    <View style={styles.bar}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.barRow}>{children}</View>
      </ScrollView>
    </View>
  );
}

// Separator between filter groups
export function FilterSeparator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: Colors.gray50,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  group: {
    flexDirection: 'column',
    gap: 3,
  },
  groupLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.extrabold,
    color: Colors.gray400,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chips: {
    flexDirection: 'row',
    gap: 3,
  },
  chip: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: Radius.round,
  },
  chipText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.gray600,
  },
  chipTextActive: {
    color: Colors.white,
  },
  separator: {
    width: 1,
    height: 28,
    backgroundColor: Colors.gray300,
    marginHorizontal: 2,
    alignSelf: 'flex-end',
    marginBottom: 2,
  },
});
