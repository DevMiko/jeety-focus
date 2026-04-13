import { PhotoChecklist } from '@/components/photo-checklist';
import { AppModal } from '@/components/ui/app-modal';
import { TypeBadge } from '@/components/ui/badge';
import { Toast } from '@/components/ui/toast';
import type { ApiRapport, Dossier, DossierType } from '@/constants/mock-data';
import { PHOTOS_APRES, PHOTOS_AVANT } from '@/constants/mock-data';
import { Colors, FontSize, FontWeight, Radius, Shadows } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RapportDetailScreen() {
  const router = useRouter();
  const auth = useAuth();
  const params = useLocalSearchParams<{ id: string }>();

  const rapport: ApiRapport | undefined = auth.rapports.find(
    (r) => String(r.id_rapport) === params.id,
  );

  // Rattachement modal
  const [rattachModal, setRattachModal] = useState(false);
  const [refInput, setRefInput] = useState('');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2500);
  };

  // Dossier suggestions
  const dossiersWithPhase = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    for (const r of auth.rapports) {
      if (r.id_dossier) {
        const key = String(r.id_dossier);
        if (!map[key]) map[key] = new Set();
        map[key].add(r.phase || 'Avant');
      }
    }
    return map;
  }, [auth.rapports]);

  const dossierSuggestions = useMemo(() => {
    if (!refInput.trim() || !rapport) return [];
    const q = refInput.toLowerCase();
    return auth.dossiers
      .filter((d: Dossier) => {
        if (!d.ref.toLowerCase().includes(q)) return false;
        const phases = dossiersWithPhase[d.id];
        if (phases && phases.has(rapport.phase)) return false;
        return true;
      })
      .slice(0, 5);
  }, [refInput, auth.dossiers, rapport, dossiersWithPhase]);

  const handleRattacher = useCallback(() => {
    if (!rapport || !refInput.trim()) return;
    const dossier = auth.dossiers.find(
      (d: Dossier) => d.ref.toLowerCase() === refInput.trim().toLowerCase()
    );
    auth.apiAction(
      {
        action: 'attach-rapport',
        token: auth.usertoken,
        id_rapport: rapport.id_rapport,
        reference_dossier: refInput.trim(),
        id_dossier: dossier?.id || null,
      },
      () => {
        setRattachModal(false);
        setRefInput('');
        Promise.all([auth.refreshRapports(), auth.refreshDossiers()]).then(() => {
          showToast('Rapport rattaché au dossier ' + refInput.trim() + ' ✓');
        });
      },
      (msg) => {
        showToast(msg || 'Erreur lors du rattachement', 'error');
      },
    );
  }, [rapport, refInput, auth]);

  if (!rapport) {
    return (
      <SafeAreaView style={styles.screen}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>‹ Retour</Text>
        </TouchableOpacity>
        <Text style={styles.notFound}>Rapport introuvable</Text>
      </SafeAreaView>
    );
  }

  const phaseLabel = rapport.phase === 'Avant' ? 'Avant travaux' : 'Après travaux';
  const types = (rapport.types || []) as DossierType[];
  const pdfUrl = auth.getPdfUrl(rapport.id_rapport);

  const formatDate = (dateStr: string) => {
    const dt = new Date(dateStr);
    return `${dt.getDate().toString().padStart(2, '0')}/${(dt.getMonth() + 1).toString().padStart(2, '0')}/${String(dt.getFullYear()).slice(2)}`;
  };

  const isLibre = !rapport.id_dossier;

  // Build photo labels from actual photos, using type fallbacks for names
  const photoLabels = useMemo(() => {
    const rapportPhotos = rapport.photos || [];
    if (rapportPhotos.length === 0) return undefined;

    // Try fallback labels from types first (they match the checklist items)
    const ph = rapport.phase === 'Avant' ? 'avant' : 'apres';
    const fallback: string[] = Array.from(
      new Set(types.flatMap((t: DossierType) => (ph === 'avant' ? PHOTOS_AVANT[t] : PHOTOS_APRES[t]) || []))
    );

    if (fallback.length > 0) return fallback;

    // Last resort: use photo_type or generic label
    return rapportPhotos.map((p, i) => {
      const label = p.photo_type?.replace(/_/g, ' ').replace(/photo$/i, '').trim();
      return label || `Photo ${i + 1}`;
    });
  }, [rapport.photos, rapport.phase, types]);

  return (
    <SafeAreaView style={styles.screen}>
      {/* ─── Header bleu ─── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>‹ Retour</Text>
        </TouchableOpacity>

        <View style={styles.heroCard}>
          <Text style={styles.heroRef}>
            {rapport.reference_rapport} • {phaseLabel}
          </Text>
          <Text style={styles.heroName}>{rapport.client_name || 'Sans nom'}</Text>
          <Text style={styles.heroAddress}>{rapport.client_address || ''}</Text>

          {types.length > 0 && (
            <View style={styles.badges}>
              {types.map((t) => (
                <TypeBadge key={t} type={t} />
              ))}
            </View>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentPadding}
        showsVerticalScrollIndicator={false}
      >
        {/* Bouton rattacher (rapport libre uniquement) */}
        {isLibre && (
          <TouchableOpacity
            style={styles.rattacherBtn}
            onPress={() => { setRefInput(''); setRattachModal(true); }}
            activeOpacity={0.85}
          >
            <Text style={styles.rattacherIcon}>🔗</Text>
            <Text style={styles.rattacherText}>Rattacher à un dossier CEE</Text>
          </TouchableOpacity>
        )}

        {/* Section photos */}
        <View style={styles.sectionTitle}>
          <View style={styles.dotGreen} />
          <Text style={styles.sectionLabel}>
            Photos {rapport.phase === 'Avant' ? 'avant' : 'après'} travaux
          </Text>
        </View>

        <PhotoChecklist
          phase={rapport.phase === 'Avant' ? 'avant' : 'apres'}
          types={types}
          rapportRef={rapport.reference_rapport}
          rapportDate={formatDate(rapport.date_creation)}
          rapportPdfUrl={pdfUrl}
          photoLabels={photoLabels}
        />
      </ScrollView>

      {/* ── Modal Rattachement ── */}
      <AppModal
        visible={rattachModal}
        onClose={() => setRattachModal(false)}
        title="Rattacher à un dossier"
        footer={
          <>
            <TouchableOpacity
              style={[styles.modalBtn, styles.modalBtnOutline]}
              onPress={() => setRattachModal(false)}
            >
              <Text style={styles.modalBtnOutlineText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalBtn, styles.modalBtnPrimary, !refInput.trim() && styles.modalBtnDisabled]}
              onPress={handleRattacher}
              disabled={!refInput.trim()}
            >
              <Text style={styles.modalBtnPrimaryText}>🔗 Rattacher</Text>
            </TouchableOpacity>
          </>
        }
      >
        <Text style={styles.modalDesc}>
          Saisissez la référence du dossier CEE pour rattacher ce rapport.
        </Text>
        <Text style={styles.inputLabel}>Référence dossier CEE</Text>
        <TextInput
          style={styles.modalInput}
          value={refInput}
          onChangeText={setRefInput}
          placeholder="DOS-XXXXXX-XXXX"
          placeholderTextColor={Colors.gray400}
          autoCapitalize="characters"
        />
        {dossierSuggestions.length > 0 && (
          <View style={styles.suggestions}>
            {dossierSuggestions.map((d: Dossier) => (
              <TouchableOpacity
                key={d.id}
                style={styles.suggestionItem}
                onPress={() => setRefInput(d.ref)}
              >
                <Text style={styles.suggestionRef}>{d.ref}</Text>
                <Text style={styles.suggestionName} numberOfLines={1}>{d.clientName}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </AppModal>

      <Toast visible={toast.visible} message={toast.message} type={toast.type} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.gray50 },
  header: {
    backgroundColor: Colors.blue,
    paddingHorizontal: 14,
    paddingBottom: 16,
  },
  backBtn: { paddingVertical: 10 },
  backText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  heroCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: 12,
    ...Shadows.sm,
  },
  heroRef: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.extrabold,
    color: Colors.blue,
    marginBottom: 4,
  },
  heroName: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: Colors.gray800,
    marginBottom: 2,
  },
  heroAddress: {
    fontSize: FontSize.md,
    color: Colors.gray500,
    marginBottom: 8,
  },
  badges: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
  },
  content: { flex: 1 },
  contentPadding: { padding: 14, paddingBottom: 40 },
  rattacherBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.blue,
    borderStyle: 'dashed',
    borderRadius: Radius.lg,
    paddingVertical: 12,
    marginBottom: 16,
  },
  rattacherIcon: { fontSize: 16 },
  rattacherText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.blue,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  dotGreen: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10b981',
  },
  sectionLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.gray600,
  },
  notFound: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: FontSize.xl,
    color: Colors.gray500,
  },
  // Modal styles
  modalBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
  modalBtnOutline: {
    borderWidth: 1,
    borderColor: Colors.gray200,
    backgroundColor: Colors.white,
  },
  modalBtnOutlineText: {
    color: Colors.gray600,
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.md,
  },
  modalBtnPrimary: {
    backgroundColor: Colors.blue,
  },
  modalBtnPrimaryText: {
    color: Colors.white,
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.md,
  },
  modalBtnDisabled: { opacity: 0.5 },
  modalDesc: {
    fontSize: FontSize.base,
    color: Colors.gray600,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.gray600,
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: Colors.gray50,
    borderRadius: Radius.md,
    padding: 10,
    fontSize: FontSize.md,
    color: Colors.gray800,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  suggestions: {
    marginTop: 6,
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray200,
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
    gap: 8,
  },
  suggestionRef: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.blue,
  },
  suggestionName: {
    flex: 1,
    fontSize: FontSize.base,
    color: Colors.gray500,
  },
});
