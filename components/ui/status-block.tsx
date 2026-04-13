import type { PhotoStatus } from '@/constants/mock-data';
import { Colors, FontSize, FontWeight, Radius } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

// ─── status-block.tsx ─────────────────────────────────────────────────────────
// Displays the "Avant travaux" / "Après travaux" status block on dossier cards.

interface StatusBlockProps {
  label: string;
  status: PhotoStatus;
  ref?: string;
  date?: string;
}

const CONFIG: Record<PhotoStatus, { bg: string; iconBg: string; icon: string; iconColor: string; labelColor: string; subText: string }> = {
  done:    { bg: '#ecfdf5', iconBg: '#10b981', icon: '✓',  iconColor: '#fff', labelColor: '#065f46', subText: 'Rapport fait' },
  pending: { bg: '#fff7ed', iconBg: '#f59e0b', icon: '📷', iconColor: '#fff', labelColor: '#92400e', subText: 'À photographier' },
  locked:  { bg: '#f3f4f6', iconBg: '#d1d5db', icon: '🔒', iconColor: '#fff', labelColor: '#9ca3af', subText: '—' },
};

export function StatusBlock({ label, status, ref: refStr, date }: StatusBlockProps) {
  const c = CONFIG[status];

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      {/* Icon + label row */}
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: c.iconBg }]}>
          <Text style={[styles.iconText, { color: c.iconColor }]}>{c.icon}</Text>
        </View>
        <Text style={[styles.label, { color: c.labelColor }]}>{label}</Text>
      </View>

      {/* Detail row */}
      {status === 'done' && refStr ? (
        <View style={styles.detailRow}>
          <Text style={styles.refText}>{refStr}</Text>
          {date ? <Text style={styles.dateText}> • {date}</Text> : null}
        </View>
      ) : (
        <Text style={[styles.subText, { color: c.labelColor }]}>{c.subText}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: Radius.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  iconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 26,
  },
  refText: {
    fontSize: FontSize.xs,
    color: Colors.blue,
    fontWeight: FontWeight.bold,
  },
  dateText: {
    fontSize: FontSize.xs,
    color: Colors.gray400,
  },
  subText: {
    fontSize: FontSize.xs,
    marginLeft: 26,
  },
});
