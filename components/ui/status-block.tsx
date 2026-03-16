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

const CHECK_SVG_PLACEHOLDER = '✓';

function StatusIcon({ status }: { status: PhotoStatus }) {
  const s = styles[status];
  return (
    <View style={[styles.iconBase, s]}>
      <Text style={styles.iconText}>
        {status === 'done' ? '✓' : status === 'pending' ? '⏱' : '🔒'}
      </Text>
    </View>
  );
}

export function StatusBlock({ label, status, ref: refStr, date }: StatusBlockProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <StatusIcon status={status} />
      </View>
      {refStr ? (
        <Text style={styles.info}>
          <Text style={styles.infoRef}>{refStr}</Text>
          {date ? <Text style={styles.infoDate}> • {date}</Text> : null}
        </Text>
      ) : (
        <View style={styles.dashRow}>
          {status === 'pending' ? (
            <View style={styles.waitingTag}>
              <Text style={styles.waitingText}>En attente</Text>
            </View>
          ) : (
            <Text style={styles.dash}>—</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray50,
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.gray500,
  },
  iconBase: {
    width: 16,
    height: 16,
    borderRadius: Radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  done: { backgroundColor: Colors.green },
  pending: { backgroundColor: Colors.orange },
  locked: { backgroundColor: Colors.gray300 },
  iconText: {
    fontSize: 8,
    color: Colors.white,
    fontWeight: FontWeight.bold,
  },
  info: {
    fontSize: FontSize.xs,
  },
  infoRef: {
    color: Colors.blue,
    fontWeight: FontWeight.bold,
  },
  infoDate: {
    color: Colors.gray400,
  },
  dashRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 14,
  },
  waitingTag: {
    backgroundColor: '#fef3c7',
    borderRadius: Radius.xs,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  waitingText: {
    fontSize: FontSize.xs,
    color: '#b45309',
    fontWeight: FontWeight.extrabold,
  },
  dash: {
    color: Colors.gray400,
    fontSize: FontSize.base,
  },
});
