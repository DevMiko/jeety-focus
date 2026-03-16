// ─── Certificall API Service ──────────────────────────────────────────────────
// Stub mockée — à remplacer par les vrais credentials Certificall
// Documentation : https://certificall.fr (API B2B — contacter Certificall pour les accès)
//
// Pour brancher la vraie API :
//   1. Remplacer CERTIFICALL_API_KEY et CERTIFICALL_API_URL
//   2. Adapter le format de la requête selon leur doc (multipart/form-data ou JSON)
//   3. Retirer le bloc "MOCK" en bas et activer le bloc "REAL API"
//
// NOTE : Ce service est autonome (Certificall = API tierce).
// Pour les appels API Jeety internes, utiliser AuthContext.apiAction()
// ─────────────────────────────────────────────────────────────────────────────


const CERTIFICALL_API_KEY = 'YOUR_API_KEY_HERE';
const CERTIFICALL_API_URL = 'https://api.certificall.fr/v1'; // à confirmer avec Certificall

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CertifiedPhoto {
  uri: string;          // chemin local de la photo (file://)
  latitude: number;     // GPS lat
  longitude: number;    // GPS lng
  accuracy?: number;    // précision GPS en mètres
  timestamp: string;    // ISO 8601 : "2026-03-04T12:51:00+01:00"
  label: string;        // ex: "Groupe extérieur PAC installé"
  index: number;
}

export interface CertificallReportResult {
  reportNumber: string;   // ex: "RF-2024-1247"
  certifiedAt: string;    // ISO date
  certifiedAtFormatted: string;  // ex: "04/03/2026 12:51"
  photoCount: number;
  pdfUrl?: string;        // URL PDF horodaté (si l'API le retourne)
}

// ─── Soumission d'un rapport ──────────────────────────────────────────────────

export async function submitReport(
  photos: CertifiedPhoto[],
  dossierId: string,
  phase: 'avant' | 'apres',
): Promise<CertificallReportResult> {

  // ─── MOCK (à retirer quand les vrais credentials sont disponibles) ─────────
  await new Promise((resolve) => setTimeout(resolve, 1500)); // simule latence réseau

  const now = new Date();
  const DD = now.getDate().toString().padStart(2, '0');
  const MM = (now.getMonth() + 1).toString().padStart(2, '0');
  const YYYY = now.getFullYear();
  const hh = now.getHours().toString().padStart(2, '0');
  const mm = now.getMinutes().toString().padStart(2, '0');

  return {
    reportNumber: `RF-${YYYY}-${1200 + Math.floor(Math.random() * 99)}`,
    certifiedAt: now.toISOString(),
    certifiedAtFormatted: `${DD}/${MM}/${YYYY} ${hh}:${mm}`,
    photoCount: photos.length,
    pdfUrl: undefined,
  };
  // ─── FIN MOCK ─────────────────────────────────────────────────────────────

  // ─── VRAIE API (décommenter quand les credentials sont prêts) ─────────────
  /*
  const formData = new FormData();
  formData.append('dossier_id', dossierId);
  formData.append('phase', phase);
  formData.append('photo_count', photos.length.toString());

  for (const photo of photos) {
    formData.append('photos', {
      uri: photo.uri,
      name: `photo_${photo.index}.jpg`,
      type: 'image/jpeg',
    } as any);
    formData.append(`meta_${photo.index}`, JSON.stringify({
      label: photo.label,
      latitude: photo.latitude,
      longitude: photo.longitude,
      accuracy: photo.accuracy,
      timestamp: photo.timestamp,
    }));
  }

  const res = await axios.post(`${CERTIFICALL_API_URL}/reports`, formData, {
    headers: {
      'Authorization': `Bearer ${CERTIFICALL_API_KEY}`,
      'Accept': 'application/json',
      'Content-Type': 'multipart/form-data',
    },
  });

  const data = res.data;
  const certifiedAt = new Date(data.certified_at);
  const DD = certifiedAt.getDate().toString().padStart(2, '0');
  const MM = (certifiedAt.getMonth() + 1).toString().padStart(2, '0');
  const YYYY = certifiedAt.getFullYear();
  const hh = certifiedAt.getHours().toString().padStart(2, '0');
  const mm = certifiedAt.getMinutes().toString().padStart(2, '0');

  return {
    reportNumber: data.report_number,
    certifiedAt: data.certified_at,
    certifiedAtFormatted: `${DD}/${MM}/${YYYY} ${hh}:${mm}`,
    photoCount: photos.length,
    pdfUrl: data.pdf_url,
  };
  */
}
