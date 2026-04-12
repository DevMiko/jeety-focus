import type { DossierType } from '@/constants/mock-data';
import { PHOTOS_APRES, PHOTOS_AVANT } from '@/constants/mock-data';
import { Colors, FontSize, FontWeight, Radius, Shadows } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import type { PhotoResult } from '@/services/certificall';
import {
    SDK_AVAILABLE,
    buildMockPhotoResult,
    buildReportSummary,
    buildReportToken,
    takeCertifiedPhoto,
} from '@/services/certificall';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface RequirementItem {
  id: number;
  label: string;
}

export default function CameraScreen() {
  const router = useRouter();
  const auth = useAuth();
  const params = useLocalSearchParams<{
    dossierId?: string;
    phase?: string;
    types?: string;
    requirementsJson?: string;
  }>();

  const phase = (params.phase ?? 'avant') as 'avant' | 'apres';
  const types = (params.types ?? 'PAC').split(',') as DossierType[];
  const dossierId = params.dossierId ?? 'DOSSIER';
  const reportToken = buildReportToken(dossierId, phase);

  // Parse API requirements if provided
  const apiRequirements: RequirementItem[] = (() => {
    try {
      if (params.requirementsJson) return JSON.parse(params.requirementsJson);
    } catch { /* fallback */ }
    return [];
  })();
  const useApi = apiRequirements.length > 0;

  // Build photo list — API requirements or hardcoded fallback
  const photoLabels = useApi
    ? apiRequirements.map((r) => r.label)
    : Array.from(
        new Set(
          types.flatMap((t) => (phase === 'avant' ? PHOTOS_AVANT[t] ?? [] : PHOTOS_APRES[t] ?? []))
        )
      );
  const total = photoLabels.length;

  // ─── Permissions (only needed in mock mode) ──────────────────────────────
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [locationGranted, setLocationGranted] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationGranted(status === 'granted');
    })();
  }, []);

  // ─── State ───────────────────────────────────────────────────────────────
  const cameraRef = useRef<CameraView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [capturedPhotos, setCapturedPhotos] = useState<(PhotoResult | null)[]>(
    new Array(photoLabels.length).fill(null)
  );
  const [flash, setFlash] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const doneCount = capturedPhotos.filter(Boolean).length;

  const getNow = () => {
    const now = new Date();
    return {
      iso: now.toISOString(),
      time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
      date: `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`,
    };
  };

  // ─── Capture via SDK Certificall ─────────────────────────────────────────
  const handleCaptureSDK = async () => {
    if (isCapturing || isSubmitting) return;
    setIsCapturing(true);

    try {
      const result = await takeCertifiedPhoto(reportToken, {
        label: photoLabels[currentIndex],
        index: String(currentIndex),
        phase,
        dossierId,
      });

      // Upload to server if API requirements mode
      if (useApi && result.uri) {
        const formData = new FormData();
        formData.append('id_dossier', dossierId);
        formData.append('id_photo_requirement', String(apiRequirements[currentIndex].id));
        formData.append('phase', phase);
        formData.append('geolat', String(result.latitude ?? 0));
        formData.append('geolng', String(result.longitude ?? 0));
        formData.append('photo', {
          uri: result.uri,
          name: `photo_${dossierId}_${phase}_${currentIndex}.jpg`,
          type: 'image/jpeg',
        } as any);
        auth.uploadPhoto(formData).catch((e) => console.warn('Upload error:', e));
      }

      const next = [...capturedPhotos];
      next[currentIndex] = result;
      setCapturedPhotos(next);

      if (currentIndex < total - 1) {
        setTimeout(() => setCurrentIndex((i) => i + 1), 350);
      } else {
        await finishSession([...next]);
      }
    } catch (err: any) {
      if (err?.code === 'CANCELLED') return; // L'utilisateur a annulé — rien à faire
      console.warn('Certificall capture error:', err);
    } finally {
      setIsCapturing(false);
    }
  };

  // ─── Capture via expo-camera (fallback mock) ─────────────────────────────
  const handleCaptureMock = async () => {
    if (isCapturing || isSubmitting) return;
    setIsCapturing(true);

    try {
      setFlash(true);
      setTimeout(() => setFlash(false), 200);

      const photo = await cameraRef.current?.takePictureAsync({
        quality: 0.85,
        skipProcessing: Platform.OS === 'android',
        exif: false,
      });

      let lat = 0, lng = 0;
      if (locationGranted) {
        try {
          const pos = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        } catch (_) { /* GPS indisponible */ }
      }

      const result = buildMockPhotoResult(reportToken, photo?.uri ?? '', lat, lng);

      // Upload to server if API requirements mode
      if (useApi && photo?.uri) {
        const formData = new FormData();
        formData.append('id_dossier', dossierId);
        formData.append('id_photo_requirement', String(apiRequirements[currentIndex].id));
        formData.append('phase', phase);
        formData.append('geolat', String(lat));
        formData.append('geolng', String(lng));
        formData.append('photo', {
          uri: photo.uri,
          name: `photo_${dossierId}_${phase}_${currentIndex}.jpg`,
          type: 'image/jpeg',
        } as any);
        auth.uploadPhoto(formData).catch((e) => console.warn('Upload error:', e));
      }

      const next = [...capturedPhotos];
      next[currentIndex] = result;
      setCapturedPhotos(next);

      if (currentIndex < total - 1) {
        setTimeout(() => setCurrentIndex((i) => i + 1), 350);
      } else {
        await finishSession([...next]);
      }
    } catch (err) {
      console.warn('Capture error:', err);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleCapture = SDK_AVAILABLE ? handleCaptureSDK : handleCaptureMock;

  // ─── Fin de session → navigation vers success ────────────────────────────
  const finishSession = async (list: (PhotoResult | null)[]) => {
    setIsSubmitting(true);
    const validPhotos = list.filter(Boolean) as PhotoResult[];

    try {
      const summary = buildReportSummary(validPhotos, reportToken);
      router.replace({
        pathname: '/success',
        params: {
          phase,
          dossierRef: dossierId,
          reportNumber: summary.reportToken,
          certifiedAt: summary.certifiedAtFormatted,
          photoCount: summary.photoCount.toString(),
          pdfUrl: summary.pdfUrl,
        },
      });
    } catch (err) {
      console.error('Session finish error:', err);
      setIsSubmitting(false);
      router.replace({
        pathname: '/success',
        params: {
          phase,
          dossierRef: dossierId,
          reportNumber: reportToken,
          certifiedAt: getNow().date,
          photoCount: validPhotos.length.toString(),
        },
      });
    }
  };

  const { time, date } = getNow();

  // ─── Permission: chargement (mock mode uniquement) ────────────────────────
  if (!SDK_AVAILABLE && !cameraPermission) {
    return (
      <SafeAreaView style={styles.permScreen}>
        <ActivityIndicator color={Colors.blue} size="large" />
      </SafeAreaView>
    );
  }

  // ─── Permission: refusée (mock mode uniquement) ───────────────────────────
  if (!SDK_AVAILABLE && !cameraPermission?.granted) {
    return (
      <SafeAreaView style={styles.permScreen}>
        <Text style={styles.permIcon}>📷</Text>
        <Text style={styles.permTitle}>Accès caméra requis</Text>
        <Text style={styles.permSub}>
          Jeety Focus a besoin d'accéder à votre caméra pour prendre les photos de chantier.
        </Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestCameraPermission}>
          <Text style={styles.permBtnText}>Autoriser la caméra</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.permCancelBtn} onPress={() => router.back()}>
          <Text style={styles.permCancelText}>Retour</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ─── UI principale ────────────────────────────────────────────────────────
  return (
    <View style={styles.screen}>

      {/* Caméra en fond (mock mode uniquement) */}
      {!SDK_AVAILABLE && (
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
      )}

      {/* Flash (mock mode) */}
      {!SDK_AVAILABLE && flash && <View style={styles.flashOverlay} />}

      {/* Overlay certification */}
      {isSubmitting && (
        <View style={styles.submittingOverlay}>
          <View style={styles.submittingCard}>
            <ActivityIndicator color={Colors.blue} size="large" />
            <Text style={styles.submittingTitle}>Certification en cours…</Text>
            <Text style={styles.submittingSub}>Horodatage et géolocalisation des photos</Text>
          </View>
        </View>
      )}

      <SafeAreaView style={styles.overlay} pointerEvents={isSubmitting ? 'none' : 'box-none'}>

        {/* Top: close + barre de progression */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
          <View style={styles.progressBar}>
            {photoLabels.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.progressSegment,
                  capturedPhotos[i] ? styles.progressDone
                    : i === currentIndex ? styles.progressActive
                    : styles.progressIdle,
                ]}
              />
            ))}
          </View>
          <Text style={styles.progressCounter}>{Math.min(currentIndex + 1, total)}/{total}</Text>
        </View>

        {/* Phase badge */}
        <View style={styles.phaseBadgeRow}>
          <View style={[styles.phaseBadge, { backgroundColor: phase === 'avant' ? Colors.orange : Colors.green }]}>
            <Text style={styles.phaseBadgeText}>
              {phase === 'avant' ? '📷 Avant travaux' : '📷 Après travaux'}
            </Text>
          </View>
        </View>

        {/* Guides de coin */}
        <View style={styles.cornersWrapper} pointerEvents="none">
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
        </View>

        {/* Instruction photo */}
        <View style={styles.instructionBox}>
          <Text style={styles.instructionNum}>{currentIndex + 1}/{total}</Text>
          <Text style={styles.instructionText} numberOfLines={2}>{photoLabels[currentIndex]}</Text>
          {capturedPhotos[currentIndex] && (
            <View style={styles.capturedBadge}>
              <Text style={styles.capturedBadgeText}>✓ OK</Text>
            </View>
          )}
        </View>

        {/* Barre GPS / heure / date */}
        <View style={styles.infoBar}>
          <Text style={styles.infoItem}>{locationGranted ? '📍 GPS activé' : '📍 GPS N/A'}</Text>
          <Text style={styles.infoItem}>🕐 {time}</Text>
          <Text style={styles.infoItem}>📅 {date}</Text>
        </View>

        {/* Boutons capture */}
        <View style={styles.captureRow}>
          <TouchableOpacity
            style={[styles.navBtn, currentIndex === 0 && styles.navBtnDisabled]}
            onPress={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
          >
            <Text style={styles.navBtnText}>‹</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.captureBtn, (isCapturing || isSubmitting) && styles.captureBtnDisabled]}
            onPress={handleCapture}
            activeOpacity={0.85}
            disabled={isCapturing || isSubmitting}
          >
            <View style={styles.captureBtnInner}>
              {isCapturing
                ? <ActivityIndicator color="#fff" size="small" />
                : capturedPhotos[currentIndex]
                  ? <Text style={styles.captureCheckText}>✓</Text>
                  : <Text style={styles.captureCamText}>📷</Text>
              }
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navBtn, currentIndex >= total - 1 && styles.navBtnDisabled]}
            onPress={() => setCurrentIndex((i) => Math.min(total - 1, i + 1))}
            disabled={currentIndex >= total - 1 || isCapturing}
          >
            <Text style={styles.navBtnText}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Terminer en avance */}
        {doneCount > 0 && doneCount < total && (
          <TouchableOpacity
            style={styles.finishEarlyBtn}
            onPress={() => finishSession(capturedPhotos)}
            disabled={isSubmitting}
          >
            <Text style={styles.finishEarlyText}>Terminer ({doneCount}/{total} photos)</Text>
          </TouchableOpacity>
        )}

      </SafeAreaView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const CORNER = 24;
const CORNER_T = 3;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000' },
  overlay: { flex: 1, justifyContent: 'space-between' },

  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.85)',
    zIndex: 10,
  },

  submittingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  submittingCard: {
    backgroundColor: '#fff',
    borderRadius: Radius.xl,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 40,
    gap: 12,
    ...Shadows.lg,
  },
  submittingTitle: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.gray800, textAlign: 'center' },
  submittingSub: { fontSize: FontSize.md, color: Colors.gray500, textAlign: 'center' },

  permScreen: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  permIcon: { fontSize: 48, marginBottom: 8 },
  permTitle: { fontSize: FontSize['3xl'], fontWeight: FontWeight.bold, color: Colors.gray800, textAlign: 'center' },
  permSub: { fontSize: FontSize.md, color: Colors.gray500, textAlign: 'center', lineHeight: 20 },
  permBtn: { backgroundColor: Colors.blue, paddingVertical: 14, paddingHorizontal: 32, borderRadius: Radius.round, marginTop: 16 },
  permBtnText: { color: '#fff', fontWeight: FontWeight.bold, fontSize: FontSize.lg },
  permCancelBtn: { marginTop: 8, padding: 8 },
  permCancelText: { color: Colors.gray500, fontSize: FontSize.md },

  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4, gap: 10 },
  closeBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { color: '#fff', fontSize: 14, fontWeight: FontWeight.bold },
  progressBar: { flex: 1, flexDirection: 'row', gap: 4, height: 4 },
  progressSegment: { flex: 1, borderRadius: 2 },
  progressDone: { backgroundColor: Colors.green },
  progressActive: { backgroundColor: '#fff' },
  progressIdle: { backgroundColor: 'rgba(255,255,255,0.3)' },
  progressCounter: { color: '#fff', fontSize: FontSize.base, fontWeight: FontWeight.semibold, minWidth: 28, textAlign: 'right' },

  phaseBadgeRow: { alignItems: 'center', paddingTop: 4 },
  phaseBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: Radius.round },
  phaseBadgeText: { color: '#fff', fontSize: FontSize.md, fontWeight: FontWeight.semibold },

  cornersWrapper: { position: 'absolute', top: 90, left: 20, right: 20, bottom: 230 },
  corner: { position: 'absolute', width: CORNER, height: CORNER, borderColor: '#fff' },
  cornerTL: { top: 0, left: 0, borderTopWidth: CORNER_T, borderLeftWidth: CORNER_T },
  cornerTR: { top: 0, right: 0, borderTopWidth: CORNER_T, borderRightWidth: CORNER_T },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: CORNER_T, borderLeftWidth: CORNER_T },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: CORNER_T, borderRightWidth: CORNER_T },

  instructionBox: {
    marginHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: Radius.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  instructionNum: { color: Colors.orange, fontSize: FontSize.md, fontWeight: FontWeight.bold },
  instructionText: { flex: 1, color: '#fff', fontSize: FontSize.md, fontWeight: FontWeight.medium },
  capturedBadge: { backgroundColor: Colors.green, borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 3 },
  capturedBadgeText: { color: '#fff', fontSize: FontSize.sm, fontWeight: FontWeight.semibold },

  infoBar: { flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: 16, paddingVertical: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: Radius.md },
  infoItem: { color: '#fff', fontSize: FontSize.sm, fontWeight: FontWeight.medium },

  captureRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 28, paddingVertical: 16, paddingHorizontal: 20 },
  navBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  navBtnDisabled: { opacity: 0.3 },
  navBtnText: { color: '#fff', fontSize: 26, fontWeight: FontWeight.bold, lineHeight: 28 },
  captureBtn: { width: 76, height: 76, borderRadius: 38, backgroundColor: Colors.pink, alignItems: 'center', justifyContent: 'center', ...Shadows.lg, borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)' },
  captureBtnDisabled: { opacity: 0.6 },
  captureBtnInner: { alignItems: 'center', justifyContent: 'center' },
  captureCheckText: { fontSize: 28, color: '#fff', fontWeight: FontWeight.bold },
  captureCamText: { fontSize: 28 },

  finishEarlyBtn: { marginHorizontal: 20, marginBottom: 8, paddingVertical: 12, borderRadius: Radius.md, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  finishEarlyText: { color: '#fff', fontSize: FontSize.md, fontWeight: FontWeight.semibold },
});
