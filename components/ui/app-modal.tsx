import { Colors, FontSize, FontWeight, Radius, Shadows } from '@/constants/theme';
import React from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

interface AppModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AppModal({ visible, onClose, title, children, footer }: AppModalProps) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={styles.closeBtn}>✕</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.body}>{children}</View>
              {footer && <View style={styles.footer}>{footer}</View>}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xxl,
    width: '100%',
    maxWidth: 320,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.gray800,
  },
  closeBtn: {
    fontSize: 18,
    color: Colors.gray400,
    padding: 4,
  },
  body: {
    padding: 14,
  },
  footer: {
    flexDirection: 'row',
    gap: 8,
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
  },
});
