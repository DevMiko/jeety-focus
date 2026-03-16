import type { DossierType } from '@/constants/mock-data';
import { PHOTOS_APRES, PHOTOS_AVANT } from '@/constants/mock-data';
import { Colors, FontSize, FontWeight, Radius, Shadows } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PhotoChecklistProps {
  phase: 'avant' | 'apres';
  types: DossierType[];
  checkedItems: string[];
  onToggle: (label: string) => void;
  locked?: boolean;
  onStartCamera?: () => void;
}

export function PhotoChecklist({
  phase,
  types,
  checkedItems,
  onToggle,
  locked = false,
  onStartCamera,
}: PhotoChecklistProps) {
  // Merge all photo labels for the given types
  const photos = Array.from(
    new Set(types.flatMap((t) => (phase === 'avant' ? PHOTOS_AVANT[t] : PHOTOS_APRES[t])))
  );

  const allDone = photos.every((p) => checkedItems.includes(p));
  const doneCount = photos.filter((p) => checkedItems.includes(p)).length;

  const cardBorderColor = locked
    ? 'transparent'
    : allDone
    ? 'transparent'
    : Colors.blue;

  const statusLabel = locked
    ? 'Verrouillé'
    : allDone
    ? `Terminé (${doneCount}/${photos.length})`
    : `En cours (${doneCount}/${photos.length})`;

  const statusStyle = locked
    ? styles.statusLocked
    : allDone
    ? styles.statusDone
    : styles.statusPending;

  return (
    <View style={[styles.card, { borderColor: cardBorderColor }, locked && styles.cardLocked]}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {phase === 'avant' ? 'Avant travaux' : 'Après travaux'}
        </Text>
        <View style={[styles.statusTag, statusStyle]}>
          <Text style={[styles.statusText, statusStyle]}>{statusLabel}</Text>
        </View>
      </View>

      <View style={styles.list}>
        {photos.map((photo) => {
          const isDone = checkedItems.includes(photo);
          return (
            <TouchableOpacity
              key={photo}
              style={[styles.item, isDone && styles.itemDone]}
              onPress={() => !locked && onToggle(photo)}
              activeOpacity={locked ? 1 : 0.7}
              disabled={locked}
            >
              <View style={[styles.itemIcon, isDone && styles.itemIconDone]}>
                <Text style={styles.itemIconText}>{isDone ? '✓' : '📷'}</Text>
              </View>
              <Text style={[styles.itemText, isDone && styles.itemTextDone]} numberOfLines={2}>
                {photo}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {!locked && onStartCamera && (
        <TouchableOpacity
          style={[styles.cameraBtn, allDone && styles.cameraBtnDone]}
          onPress={onStartCamera}
          activeOpacity={0.85}
        >
          <Text style={styles.cameraBtnText}>
            {allDone ? '✓ Photos complètes' : '📷 Prendre les photos'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 12,
    borderWidth: 2,
    ...Shadows.sm,
  },
  cardLocked: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.gray800,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.round,
  },
  statusText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  statusPending: {
    backgroundColor: '#fef3c7',
    color: '#b45309',
  },
  statusDone: {
    backgroundColor: '#dcfce7',
    color: '#15803d',
  },
  statusLocked: {
    backgroundColor: Colors.gray100,
    color: Colors.gray400,
  },
  list: {
    gap: 4,
    marginBottom: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 6,
    paddingHorizontal: 8,
    backgroundColor: Colors.gray50,
    borderRadius: Radius.sm,
  },
  itemDone: {
    backgroundColor: '#f0fdf4',
  },
  itemIcon: {
    width: 24,
    height: 24,
    borderRadius: 5,
    backgroundColor: Colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemIconDone: {
    backgroundColor: '#dcfce7',
  },
  itemIconText: {
    fontSize: 12,
  },
  itemText: {
    flex: 1,
    fontSize: FontSize.base,
    color: Colors.gray600,
  },
  itemTextDone: {
    color: Colors.green,
  },
  cameraBtn: {
    width: '100%',
    paddingVertical: 10,
    borderRadius: Radius.lg,
    backgroundColor: Colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBtnDone: {
    backgroundColor: Colors.green,
  },
  cameraBtnText: {
    color: Colors.white,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
  },
});
