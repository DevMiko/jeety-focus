// ─── SDK Certificall — Intégration React Native ─────────────────────────────
//
// Package : @certificall/trust-sdk-rn (disponible mi-avril 2026)
//
// ┌──────────────────────────────────────────────────────────────────────────┐
// │  QUAND LE SDK EST PUBLIÉ :                                              │
// │  1. npm install @certificall/trust-sdk-rn                               │
// │  2. Passer SDK_AVAILABLE à true ci-dessous                              │
// │  3. Décommenter l'import réel (ligne ci-dessous)                        │
// │  4. Remplacer CERTIFICALL_API_KEY par votre clé cert_sdk_...            │
// │  5. eas build --platform all --profile development                      │
// └──────────────────────────────────────────────────────────────────────────┘
//
// En attendant le SDK, le mode mock garde le fonctionnement actuel
// (expo-camera + expo-location dans camera.tsx) avec des résultats simulés.
// ─────────────────────────────────────────────────────────────────────────────

// ── Décommenter quand le SDK est installé : ──
// import { CertificallTrust } from '@certificall/trust-sdk-rn';

// ─── Configuration ──────────────────────────────────────────────────────────

/** Remplacez par votre vraie clé API Certificall (format cert_sdk_...) */
const CERTIFICALL_API_KEY = 'cert_sdk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

/** 'sandbox' pour les tests, 'production' pour les vrais certificats */
const CERTIFICALL_ENV: 'production' | 'sandbox' = 'sandbox';

/**
 * Passez à true quand @certificall/trust-sdk-rn est installé.
 * En mode false, l'app utilise expo-camera + résultats simulés.
 */
export const SDK_AVAILABLE = false;

let isConfigured = false;

// ─── Types (conformes au SDK Certificall PhotoResult) ────────────────────────

export interface PhotoResult {
  itemId: string;
  caseId: string;
  reportToken: string;
  imageUrl: string;
  pdfUrl: string;
  geoloc: { lat: number; lng: number };
  createdAt: string;
}

export interface CertificallReportSummary {
  reportToken: string;
  certifiedAt: string;
  certifiedAtFormatted: string;
  photoCount: number;
  pdfUrl: string;
  photos: PhotoResult[];
}

// ─── Initialisation (appeler une seule fois au démarrage) ────────────────────

export async function initCertificall(): Promise<void> {
  if (isConfigured) return;

  if (SDK_AVAILABLE) {
    // await CertificallTrust.configure({
    //   apiKey: CERTIFICALL_API_KEY,
    //   environment: CERTIFICALL_ENV,
    // });
  }

  isConfigured = true;
}

// ─── Permissions (via SDK ou fallback) ───────────────────────────────────────

export async function requestCertificallPermissions(): Promise<{
  camera: boolean;
  location: boolean;
}> {
  if (SDK_AVAILABLE) {
    // const cam = await CertificallTrust.requestCameraPermission();
    // const loc = await CertificallTrust.requestLocationPermission();
    // await CertificallTrust.requestMotionPermission(); // iOS uniquement
    // return {
    //   camera: cam.status === 'granted',
    //   location: loc.status === 'granted',
    // };
  }

  // En mode mock, les permissions sont gérées par camera.tsx (expo-camera/location)
  return { camera: true, location: true };
}

// ─── Capture photo certifiée ─────────────────────────────────────────────────

export async function takeCertifiedPhoto(
  reportToken: string,
  metadata?: Record<string, string>,
): Promise<PhotoResult> {
  if (!SDK_AVAILABLE) {
    throw new Error('SDK Certificall non disponible. Utilisez le mode expo-camera.');
  }

  // const result = await CertificallTrust.takePhoto({ reportToken, metadata });
  // return {
  //   itemId: result.itemId,
  //   caseId: result.caseId,
  //   reportToken: result.reportToken,
  //   imageUrl: result.imageUrl,
  //   pdfUrl: result.pdfUrl,
  //   geoloc: result.geoloc,
  //   createdAt: result.createdAt,
  // };

  throw new Error('SDK non installé');
}

// ─── Vérification intégrité (optionnel) ──────────────────────────────────────

export async function verifyDeviceIntegrity(): Promise<{
  isVerified: boolean;
  reasons: string[];
}> {
  if (SDK_AVAILABLE) {
    // return await CertificallTrust.verifyIntegrity();
  }
  return { isVerified: true, reasons: [] };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Construit le reportToken à partir du dossier + phase */
export function buildReportToken(dossierId: string, phase: 'avant' | 'apres'): string {
  return `${dossierId}-${phase}`;
}

/** Construit un résumé de rapport à partir des photos capturées */
export function buildReportSummary(
  photos: PhotoResult[],
  reportToken: string,
): CertificallReportSummary {
  const lastPhoto = photos[photos.length - 1];
  const d = new Date(lastPhoto.createdAt);
  const DD = d.getDate().toString().padStart(2, '0');
  const MM = (d.getMonth() + 1).toString().padStart(2, '0');
  const YYYY = d.getFullYear();
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');

  return {
    reportToken,
    certifiedAt: lastPhoto.createdAt,
    certifiedAtFormatted: `${DD}/${MM}/${YYYY} ${hh}:${mm}`,
    photoCount: photos.length,
    pdfUrl: lastPhoto.pdfUrl,
    photos,
  };
}

/**
 * Construit un PhotoResult mock à partir d'une capture expo-camera.
 * Utilisé uniquement quand SDK_AVAILABLE = false.
 */
export function buildMockPhotoResult(
  reportToken: string,
  uri: string,
  lat: number,
  lng: number,
): PhotoResult {
  return {
    itemId: `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    caseId: `case-${reportToken}`,
    reportToken,
    imageUrl: uri,
    pdfUrl: '',
    geoloc: { lat, lng },
    createdAt: new Date().toISOString(),
  };
}
