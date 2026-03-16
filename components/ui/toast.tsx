import { Colors, FontSize, FontWeight, Radius, Shadows } from '@/constants/theme';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error';
}

export function Toast({ visible, message, type = 'success' }: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 20, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  return (
    <Animated.View
      style={[
        styles.container,
        type === 'success' ? styles.success : styles.error,
        { opacity, transform: [{ translateY }] },
      ]}
      pointerEvents="none"
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 110,
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: Radius.lg,
    zIndex: 9999,
    ...Shadows.lg,
  },
  success: { backgroundColor: Colors.green },
  error: { backgroundColor: Colors.error },
  text: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
});
