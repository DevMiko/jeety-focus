import * as FileSystem from 'expo-file-system/legacy';
import { CertificallTrust } from 'certificall-mobile-sdk-react-native';

// ─── Configuration ──────────────────────────────────────────────────────────

const CERTIFICALL_API_KEY = 'cer_sdk_372_6f542391562b9b58bb8bad264fbd73d81d966eb31084e9d7';
const CERTIFICALL_API_BASE = 'https://dev.certificall.app/certificall/api';
const CERTIFICALL_USERNAME = 'j.didi@jddev.com';
const CERTIFICALL_PASSWORD = '6R_rNOCuUf';
const CERTIFICALL_KEYCLOAK_TOKEN_URL = 'https://auth.certificall.app/realms/certificall-dev/protocol/openid-connect/token';

export const SDK_AVAILABLE = true;

let isConfigured = false;

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Initialisation SDK ──────────────────────────────────────────────────────

export async function initCertificall(): Promise<void> {
  if (isConfigured) return;
  await CertificallTrust.configure({
    apiKey: CERTIFICALL_API_KEY,
    baseUrl: 'https://dev.certificall.app/certificall/',
    appVersion: '0.1.3',
    debugMode: true,
  });
  isConfigured = true;
}

// ─── Permissions ─────────────────────────────────────────────────────────────

export async function requestCertificallPermissions(): Promise<{ camera: boolean; location: boolean }> {
  let camera = true;
  let location = true;
  try {
    if (typeof CertificallTrust.requestCameraPermission === 'function') {
      camera = await CertificallTrust.requestCameraPermission();
    }
  } catch { /* méthode absente en v0.1.2 */ }
  try {
    if (typeof CertificallTrust.requestLocationPermission === 'function') {
      const s = await CertificallTrust.requestLocationPermission();
      location = s === 'granted' || s === 'authorizedWhenInUse' || s === 'authorizedAlways';
    }
  } catch { /* méthode absente en v0.1.2 */ }
  try {
    if (typeof CertificallTrust.requestMotionPermission === 'function') {
      await CertificallTrust.requestMotionPermission();
    }
  } catch { /* méthode absente en v0.1.2 */ }
  return { camera, location };
}

// ─── REST API — Authentification ─────────────────────────────────────────────

let _cachedJWT: string | null = null;
let _jwtExpiry = 0;

export async function getCertificallJWT(): Promise<string> {
  if (_cachedJWT && Date.now() < _jwtExpiry) return _cachedJWT;

  // Certificall /auth/token — username/password → JWT
  try {
    const res = await fetch(`${CERTIFICALL_API_BASE.replace('/api', '')}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: CERTIFICALL_USERNAME, password: CERTIFICALL_PASSWORD }),
    });
    console.log('[Certificall] /auth/token status:', res.status);
    if (res.ok) {
      const data = await res.json();
      const token: string = data.token ?? data.access_token ?? data.jwt ?? '';
      if (token) {
        _cachedJWT = token;
        _jwtExpiry = Date.now() + (data.expires_in ?? 3600) * 1000 - 30000;
        console.log('[Certificall] JWT OK');
        return token;
      }
    } else {
      const err = await res.text();
      console.warn('[Certificall] /auth/token error:', err.slice(0, 300));
    }
  } catch (e) {
    console.warn('[Certificall] /auth/token exception:', e);
  }

  // Fallback : API key comme Bearer
  console.log('[Certificall] Fallback: API key comme Bearer');
  _cachedJWT = CERTIFICALL_API_KEY;
  _jwtExpiry = Date.now() + 10 * 60 * 1000;
  return _cachedJWT;
}

// ─── REST API — Récupération photo certifiée ──────────────────────────────────

/**
 * Interroge GET /cases?reportToken=... pour trouver l'URL de l'image
 * d'un item Certificall. Retry jusqu'à 5 fois (le SDK peut prendre un moment).
 */
async function fetchCertificallItemUrl(caseId: string, itemId: string): Promise<string | null> {
  const jwt = await getCertificallJWT();

  for (let attempt = 0; attempt < 5; attempt++) {
    if (attempt > 0) await new Promise(r => setTimeout(r, 2000));

    try {
      const res = await fetch(
        `${CERTIFICALL_API_BASE}/cases?caseId=${encodeURIComponent(caseId)}&limit=10`,
        { headers: { Authorization: `Bearer ${jwt}` } },
      );
      console.log('[Certificall] GET /cases status:', res.status, 'caseId:', caseId);
      if (!res.ok) continue;
      const raw = await res.text();
      console.log('[Certificall] GET /cases body:', raw.slice(0, 500));
      const data = JSON.parse(raw);
      const cases = Array.isArray(data) ? data : (data.data ?? data.results ?? [data]);

      for (const c of cases) {
        const items: any[] = c.items ?? [];
        const match = items.find((i) => String(i.itemId ?? i.id) === String(itemId));
        const url = match?.imageUrl ?? match?.url ?? items[0]?.imageUrl ?? items[0]?.url ?? c.caseUrl;
        if (url) return url;
      }
    } catch (e) {
      console.warn('[Certificall] fetchCertificallItemUrl attempt', attempt, e);
    }
  }

  return null;
}

/**
 * Télécharge la photo certifiée depuis Certificall et retourne
 * l'URI locale dans le cache de l'app (pour uploader sur notre serveur).
 */
export async function downloadCertificallPhoto(
  caseId: string,
  itemId: string,
  fileName: string,
): Promise<string | null> {
  if (!caseId || caseId === '0' || !itemId || itemId === '0') return null;

  try {
    const photoUrl = await fetchCertificallItemUrl(caseId, itemId);
    if (!photoUrl) {
      console.warn('[Certificall] Aucune URL trouvée pour caseId:', caseId, 'itemId:', itemId);
      return null;
    }

    const localUri = (FileSystem.cacheDirectory ?? '') + fileName;
    const jwt = await getCertificallJWT();

    const { status } = await FileSystem.downloadAsync(photoUrl, localUri, {
      headers: { Authorization: `Bearer ${jwt}` },
    });

    if (status !== 200) {
      console.warn('[Certificall] Échec téléchargement photo, status:', status);
      return null;
    }

    return localUri;
  } catch (e) {
    console.warn('[Certificall] downloadCertificallPhoto error:', e);
    return null;
  }
}

// ─── Capture photo certifiée (SDK) ───────────────────────────────────────────

export async function takeCertifiedPhoto(
  reportToken: string,
  metadata?: Record<string, string>,
): Promise<PhotoResult> {
  const result = await CertificallTrust.takePhoto({ reportToken, metadata });

  console.log('[Certificall] takePhoto raw result:', JSON.stringify(result));

  return {
    itemId: String(result.itemId ?? ''),
    caseId: String(result.caseId ?? ''),
    reportToken,
    imageUrl: '',
    pdfUrl: '',
    geoloc: { lat: 0, lng: 0 },
    createdAt: new Date().toISOString(),
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function buildReportToken(dossierId: string, phase: 'avant' | 'apres'): string {
  return `${dossierId}-${phase}`;
}

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
