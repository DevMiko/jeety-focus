import type { DossierPhoto, DossierType, PhotoRequirement } from '@/constants/mock-data';
import { PHOTOS_APRES, PHOTOS_AVANT } from '@/constants/mock-data';
import { Colors, FontSize, FontWeight, Radius, Shadows } from '@/constants/theme';
import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PhotoChecklistProps {
  phase: 'avant' | 'apres';
  types: DossierType[];
  requirements?: PhotoRequirement[];
  photos?: DossierPhoto[];
  checkedItems?: string[];
  onToggle?: (label: string) => void;
  locked?: boolean;
  onStartCamera?: () => void;
  /** Rapport info (when a report already exists for this phase) */
  rapportRef?: string;
  rapportDate?: string;
  rapportPdfUrl?: string;
  /** Direct photo labels (e.g. from rapport photos) — overrides requirements/fallback */
  photoLabels?: string[];
}

export function PhotoChecklist({
  phase,
  types,
  requirements,
  photos,
  checkedItems = [],
  onToggle,
  locked = false,
  onStartCamera,
  rapportRef,
  rapportDate,
  rapportPdfUrl,
  photoLabels,
}: PhotoChecklistProps) {
  const hasRapport = !!rapportRef;

  // Build checklist items
  const useApi = !!(requirements && requirements.length > 0);
  let items: { key: string; label: string; requirementId: number | null; isDone: boolean }[];

  if (photoLabels && photoLabels.length > 0) {
    items = photoLabels.map((label, i) => ({
      key: `photo-${i}`,
      label,
      requirementId: null,
      isDone: true,
    }));
  } else {
    const phaseRequirements = useApi
      ? requirements.filter((r) => r.phase === phase)
      : [];

    const fallbackLabels = Array.from(
      new Set(types.flatMap((t) => (phase === 'avant' ? PHOTOS_AVANT[t] : PHOTOS_APRES[t])))
    );

    items = useApi
      ? phaseRequirements.map((r) => ({
          key: String(r.id_photo_requirement),
          label: r.label,
          requirementId: r.id_photo_requirement,
          isDone: hasRapport || (photos || []).some((p) => p.id_photo_requirement === r.id_photo_requirement),
        }))
      : fallbackLabels.map((label) => ({
          key: label,
          label,
          requirementId: null as number | null,
          isDone: hasRapport || checkedItems.includes(label),
        }));
  }

  const doneCount = items.filter((i) => i.isDone).length;

  // Status label + style
  const statusLabel = locked
    ? 'Verrouillé'
    : hasRapport
    ? `${rapportRef} • ${rapportDate}`
    : `En attente`;

  const statusStyle = locked
    ? styles.statusLocked
    : hasRapport
    ? styles.statusDone
    : styles.statusPending;

  const cardBorderColor = locked
    ? 'transparent'
    : hasRapport
    ? '#10b981'
    : Colors.blue;

  return (
    <View style={[styles.card, { borderColor: cardBorderColor }, locked && styles.cardLocked]}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {items.length} photo{items.length > 1 ? 's' : ''}{hasRapport ? '' : ' requises'}
        </Text>
        <View style={[styles.statusTag, statusStyle]}>
          <Text style={[styles.statusText, statusStyle]}>{statusLabel}</Text>
        </View>
      </View>

      <View style={styles.list}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.item, item.isDone && styles.itemDone]}
            onPress={() => !locked && !hasRapport && onToggle?.(item.label)}
            activeOpacity={locked || hasRapport ? 1 : 0.7}
            disabled={locked || useApi || hasRapport}
          >
            <View style={[styles.itemIcon, item.isDone && styles.itemIconDone]}>
              <Text style={styles.itemIconText}>{item.isDone ? '✓' : '📷'}</Text>
            </View>
            <Text style={[styles.itemText, item.isDone && styles.itemTextDone]} numberOfLines={2}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bouton principal */}
      {hasRapport && rapportPdfUrl ? (
        <TouchableOpacity
          style={styles.viewBtn}
          onPress={() => Linking.openURL(rapportPdfUrl)}
          activeOpacity={0.85}
        >
          <Text style={styles.viewBtnText}>✓ Voir le rapport</Text>
        </TouchableOpacity>
      ) : !locked && onStartCamera ? (
        <TouchableOpacity
          style={styles.cameraBtn}
          onPress={onStartCamera}
          activeOpacity={0.85}
        >
          <Text style={styles.cameraBtnText}>📷 Prendre les photos</Text>
        </TouchableOpacity>
      ) : null}
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
  cameraBtnText: {
    color: Colors.white,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
  },
  viewBtn: {
    width: '100%',
    paddingVertical: 10,
    borderRadius: Radius.lg,
    backgroundColor: Colors.gray50,
    borderWidth: 1,
    borderColor: Colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewBtnText: {
    color: Colors.gray600,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
  },
});
