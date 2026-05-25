import type { DossierPhoto, DossierType, PhotoRequirement } from '@/constants/mock-data';
import { PHOTOS_APRES, PHOTOS_AVANT } from '@/constants/mock-data';
import { Colors, FontSize, FontWeight, Radius, Shadows } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import React, { useState } from 'react';
import { Alert, Image, Linking, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PhotoChecklistProps {
  phase: 'avant' | 'apres';
  types: DossierType[];
  requirements?: PhotoRequirement[];
  photos?: DossierPhoto[];
  checkedItems?: string[];
  onToggle?: (label: string) => void;
  locked?: boolean;
  onStartCamera?: () => void;
  rapportRef?: string;
  rapportDate?: string;
  rapportPdfUrl?: string;
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
  const { appBaseUrl } = useAuth();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const hasRapport = !!rapportRef;
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
    const phaseRequirements = useApi ? (requirements ?? []).filter((r) => r.phase === phase) : [];
    const fallbackLabels = Array.from(
      new Set(types.flatMap((t) => (phase === 'avant' ? PHOTOS_AVANT[t] : PHOTOS_APRES[t])))
    );
    items = useApi
      ? phaseRequirements.map((r) => ({
          key: String(r.id_photo_requirement),
          label: r.label,
          requirementId: r.id_photo_requirement,
          isDone: (photos || []).some((p) => p.id_photo_requirement === r.id_photo_requirement),
        }))
      : fallbackLabels.map((label) => ({
          key: label,
          label,
          requirementId: null as number | null,
          isDone: checkedItems.includes(label),
        }));
  }

  // Photos de la phase, dans l'ordre, pour le matching par index (photoLabels path)
  const phasePhotos = (photos || []).filter((p) => p.phase === phase);
  console.log('[PhotoChecklist] phase:', phase, 'phasePhotos:', JSON.stringify(phasePhotos));

  const getPhotoUrl = (item: (typeof items)[0], index: number): string | null => {
    let photo: DossierPhoto | undefined;
    if (item.requirementId !== null) {
      photo = phasePhotos.find((p) => p.id_photo_requirement === item.requirementId);
    } else {
      photo = phasePhotos[index];
    }
    if (!photo?.file_path) return null;
    return appBaseUrl + photo.file_path;
  };

  const doneCount = items.filter((i) => i.isDone).length;

  const statusLabel = locked
    ? 'Verrouillé'
    : hasRapport
    ? `${rapportRef} • ${rapportDate}`
    : 'En attente';

  const statusStyle = locked ? styles.statusLocked : hasRapport ? styles.statusDone : styles.statusPending;
  const allDone = items.length > 0 && doneCount === items.length;
  const cardBorderColor = locked ? 'transparent' : allDone ? '#10b981' : Colors.blue;

  return (
    <>
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
          {items.map((item, index) => {
            const photoUrl = item.isDone ? getPhotoUrl(item, index) : null;
            return (
              <View key={item.key} style={[styles.item, item.isDone && styles.itemDone]}>
                {/* Thumbnail cliquable si photo disponible */}
                {photoUrl ? (
                  <TouchableOpacity onPress={() => setPreviewUrl(photoUrl)} activeOpacity={0.8}>
                    <Image
                      source={{ uri: photoUrl }}
                      style={styles.thumbnail}
                      onError={() => console.warn('[PhotoChecklist] Image failed to load:', photoUrl)}
                    />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.itemIcon, item.isDone && styles.itemIconDone]}
                    onPress={() => !locked && !hasRapport && onToggle?.(item.label)}
                    activeOpacity={locked || hasRapport ? 1 : 0.7}
                    disabled={locked || useApi || hasRapport}
                  >
                    <Text style={styles.itemIconText}>{item.isDone ? '✓' : '📷'}</Text>
                  </TouchableOpacity>
                )}
                <Text
                  style={[styles.itemText, item.isDone && styles.itemTextDone]}
                  numberOfLines={2}
                >
                  {item.label}
                </Text>
                {photoUrl && (
                  <Text style={styles.zoomHint}>🔍</Text>
                )}
              </View>
            );
          })}
        </View>

        {!locked && onStartCamera && (
          <TouchableOpacity
            style={styles.cameraBtn}
            activeOpacity={0.85}
            onPress={() => {
              if (doneCount > 0) {
                Alert.alert(
                  'Reprendre les photos',
                  `Les ${doneCount} photo${doneCount > 1 ? 's' : ''} existante${doneCount > 1 ? 's' : ''} seront supprimées. Continuer ?`,
                  [
                    { text: 'Annuler', style: 'cancel' },
                    { text: 'Reprendre', style: 'destructive', onPress: onStartCamera },
                  ],
                );
              } else {
                onStartCamera();
              }
            }}
          >
            <Text style={styles.cameraBtnText}>
              {doneCount > 0 ? '📷 Reprendre les photos' : '📷 Prendre les photos'}
            </Text>
          </TouchableOpacity>
        )}
        {hasRapport && rapportPdfUrl && (
          <TouchableOpacity
            style={[styles.viewBtn, !locked && onStartCamera ? { marginTop: 8 } : undefined]}
            onPress={() => Linking.openURL(rapportPdfUrl)}
            activeOpacity={0.85}
          >
            <Text style={styles.viewBtnText}>📄 Voir le rapport</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Modale plein écran */}
      <Modal visible={!!previewUrl} transparent animationType="fade" onRequestClose={() => setPreviewUrl(null)}>
        <Pressable style={styles.modalBg} onPress={() => setPreviewUrl(null)}>
          <Image
            source={{ uri: previewUrl ?? '' }}
            style={styles.previewImg}
            resizeMode="contain"
          />
          <View style={styles.closeHint}>
            <Text style={styles.closeHintText}>Appuyer pour fermer</Text>
          </View>
        </Pressable>
      </Modal>
    </>
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
    width: 36,
    height: 36,
    borderRadius: 5,
    backgroundColor: Colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemIconDone: {
    backgroundColor: '#dcfce7',
  },
  itemIconText: {
    fontSize: 14,
  },
  thumbnail: {
    width: 36,
    height: 36,
    borderRadius: 5,
    backgroundColor: Colors.gray200,
  },
  itemText: {
    flex: 1,
    fontSize: FontSize.base,
    color: Colors.gray600,
  },
  itemTextDone: {
    color: Colors.green,
  },
  zoomHint: {
    fontSize: 12,
    opacity: 0.5,
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
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImg: {
    width: '100%',
    height: '85%',
  },
  closeHint: {
    marginTop: 16,
  },
  closeHintText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: FontSize.sm,
  },
});
