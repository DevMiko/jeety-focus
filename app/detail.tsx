import { PhotoChecklist } from '@/components/photo-checklist';
import { TypeBadge } from '@/components/ui/badge';
import type { Dossier, DossierPhoto, DossierType, PhotoRequirement } from '@/constants/mock-data';
import { DOSSIERS_ARTISAN, DOSSIERS_OUVRIER, DOSSIERS_SOUSTRAITANT } from '@/constants/mock-data';
import { Colors, FontSize, FontWeight, Radius, Shadows } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/hooks/use-role';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DetailScreen() {
  const router = useRouter();
  const auth = useAuth();
  const { role } = useRole();
  const params = useLocalSearchParams<{ id: string }>();

  // Use API dossiers if available, fallback to mock
  const allDossiers = auth.dossiers.length > 0
    ? auth.dossiers
    : role === 'artisan'
    ? DOSSIERS_ARTISAN
    : role === 'soustraitant'
    ? DOSSIERS_SOUSTRAITANT
    : DOSSIERS_OUVRIER;

  const dossier: Dossier | undefined = allDossiers.find((d) => d.id === params.id) ?? allDossiers[0];

  // Calculer le statut avant/après depuis les rapports rattachés
  const rattachedRapports = auth.rapports.filter((r) => dossier && String(r.id_dossier) === dossier.id);
  const hasRapportAvant = rattachedRapports.some((r) => r.phase === 'Avant');
  const hasRapportApres = rattachedRapports.some((r) => r.phase === 'Après');

  // ─── Photo requirements + photos from API ────────────────────────────────
  const [requirements, setRequirements] = useState<PhotoRequirement[]>([]);
  const [dossierPhotos, setDossierPhotos] = useState<DossierPhoto[]>([]);

  // Legacy: local checklist fallback (when no API requirements)
  const [avantChecked, setAvantChecked] = useState<string[]>([]);
  const [apresChecked, setApresChecked] = useState<string[]>([]);

  // Load requirements + photos on mount
  useEffect(() => {
    if (!dossier) return;

    // Load API photo requirements from dossier's travaux
    const idCeeFiches = (dossier.travaux || [])
      .map((t) => t.id_cee_fiche)
      .filter((id): id is number => id !== null);

    if (idCeeFiches.length > 0) {
      auth.getPhotoRequirements(idCeeFiches).then(setRequirements);
    }

    // Load existing photos for this dossier
    auth.getDossierPhotos(dossier.id).then(setDossierPhotos);

    // Also load legacy local checklists (fallback)
    (async () => {
      try {
        const avant = await auth.loadChecklist(dossier.id, 'avant');
        if (avant.length > 0) setAvantChecked(avant);
        const apres = await auth.loadChecklist(dossier.id, 'apres');
        if (apres.length > 0) setApresChecked(apres);
      } catch {
        // Fallback: start empty
      }
    })();
  }, [dossier?.id]);

  const handleToggleAvant = useCallback((label: string) => {
    setAvantChecked((prev) => {
      const next = prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label];
      if (dossier) auth.saveChecklist(dossier.id, 'avant', next).catch(() => {});
      return next;
    });
  }, [dossier?.id]);

  const handleToggleApres = useCallback((label: string) => {
    setApresChecked((prev) => {
      const next = prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label];
      if (dossier) auth.saveChecklist(dossier.id, 'apres', next).catch(() => {});
      return next;
    });
  }, [dossier?.id]);

  // Refresh photos after camera returns
  const refreshPhotos = useCallback(() => {
    if (!dossier) return;
    auth.getDossierPhotos(dossier.id).then(setDossierPhotos);
  }, [dossier?.id]);

  if (!dossier) {
    return (
      <SafeAreaView style={styles.screen}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.notFound}>Dossier introuvable</Text>
      </SafeAreaView>
    );
  }

  // Avant: déverrouillé si un rapport "Avant" est rattaché, sinon pending
  // Après: déverrouillé si un rapport "Après" est rattaché, sinon locked tant que avant pas fait
  const avantLocked = false; // toujours accessible pour prendre des photos
  const apresLocked = !hasRapportAvant && !hasRapportApres; // locked seulement si aucun rapport

  return (
    <SafeAreaView style={styles.screen}>
      {/* ─── Blue header ─── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>

        {/* Hero card */}
        <View style={styles.heroCard}>
          {/* Top: ref + donneur tag */}
          <View style={styles.heroTop}>
            <Text style={styles.heroRef}>{dossier.ref}</Text>
            {dossier.donneurOrdre && (role === 'soustraitant' || role === 'ouvrier') && (
              <View style={styles.donneurTag}>
                <Text style={styles.donneurTagText}>via <Text style={styles.donneurTagBold}>{dossier.donneurOrdre}</Text></Text>
              </View>
            )}
          </View>

          {/* Name */}
          <Text style={styles.heroName}>{dossier.clientName}</Text>
          <Text style={styles.heroAddress}>{dossier.address}</Text>

          {/* Phone */}
          <TouchableOpacity onPress={() => Linking.openURL(`tel:${dossier.phone.replace(/\s/g, '')}`)}>
            <Text style={styles.heroPhone}>📞 {dossier.phone}</Text>
          </TouchableOpacity>

          {/* Type badges */}
          <View style={styles.badges}>
            {dossier.types.map((t: DossierType) => (
              <TypeBadge key={t} type={t} />
            ))}
          </View>

          {/* Assigned ouvrier */}
          {dossier.assignedTo && (
            <View style={styles.ouvrierTag}>
              <Text style={styles.ouvrierTagText}>👤 {dossier.assignedTo}</Text>
            </View>
          )}
        </View>

        {/* Rattacher rapport (artisan only) */}
        {role === 'artisan' && (
          <TouchableOpacity
            style={styles.rattacherBtn}
            onPress={() => router.push('/rapports')}
          >
            <Text style={styles.rattacherText}>+ Rattacher un rapport libre</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ─── Scrollable content ─── */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentPadding}
        showsVerticalScrollIndicator={false}
      >
        {/* Rapports rattachés */}
        {rattachedRapports.length > 0 && (
          <View style={styles.rapportsSection}>
            {rattachedRapports.map((r) => (
              <View key={r.id_rapport} style={styles.rapportTag}>
                <Text style={styles.rapportTagIcon}>{r.phase === 'Avant' ? '📋' : '📋'}</Text>
                <Text style={styles.rapportTagText}>
                  Rapport {r.phase} — {r.reference_rapport}
                </Text>
                <Text style={styles.rapportTagCheck}>✓</Text>
              </View>
            ))}
          </View>
        )}

        {/* Avant travaux */}
        <View style={styles.sectionTitle}>
          <Text style={styles.sectionLabel}>📷 Photos avant travaux</Text>
        </View>
        <PhotoChecklist
          phase="avant"
          types={dossier.types}
          requirements={requirements}
          photos={dossierPhotos}
          checkedItems={avantChecked}
          onToggle={handleToggleAvant}
          locked={avantLocked}
          onStartCamera={() =>
            router.push({
              pathname: '/camera',
              params: {
                dossierId: dossier.id,
                phase: 'avant',
                types: dossier.types.join(','),
                requirementsJson: JSON.stringify(
                  requirements
                    .filter((r) => r.phase === 'avant')
                    .map((r) => ({ id: r.id_photo_requirement, label: r.label }))
                ),
              },
            })
          }
        />

        {/* Après travaux */}
        <View style={[styles.sectionTitle, { marginTop: 12 }]}>
          <Text style={styles.sectionLabel}>📷 Photos après travaux</Text>
        </View>
        <PhotoChecklist
          phase="apres"
          types={dossier.types}
          requirements={requirements}
          photos={dossierPhotos}
          checkedItems={apresChecked}
          onToggle={handleToggleApres}
          locked={apresLocked}
          onStartCamera={() =>
            router.push({
              pathname: '/camera',
              params: {
                dossierId: dossier.id,
                phase: 'apres',
                types: dossier.types.join(','),
                requirementsJson: JSON.stringify(
                  requirements
                    .filter((r) => r.phase === 'apres')
                    .map((r) => ({ id: r.id_photo_requirement, label: r.label }))
                ),
              },
            })
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  header: {
    backgroundColor: Colors.blue,
    paddingHorizontal: 14,
    paddingBottom: 16,
  },
  backBtn: {
    paddingVertical: 10,
  },
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
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  heroRef: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.extrabold,
    color: Colors.blue,
  },
  donneurTag: {
    backgroundColor: Colors.blue,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.xs,
  },
  donneurTagText: {
    fontSize: FontSize.xs,
    color: Colors.white,
  },
  donneurTagBold: {
    fontWeight: FontWeight.bold,
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
    marginBottom: 4,
  },
  heroPhone: {
    fontSize: FontSize.md,
    color: Colors.blue,
    fontWeight: FontWeight.medium,
    marginBottom: 8,
  },
  badges: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
  },
  ouvrierTag: {
    marginTop: 8,
    backgroundColor: 'rgba(0,61,122,0.08)',
    borderRadius: Radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  ouvrierTagText: {
    fontSize: FontSize.base,
    color: Colors.blue,
    fontWeight: FontWeight.medium,
  },
  rattacherBtn: {
    marginTop: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    borderStyle: 'dashed',
    borderRadius: Radius.lg,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  rattacherText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  content: {
    flex: 1,
  },
  contentPadding: {
    padding: 14,
    paddingBottom: 40,
  },
  sectionTitle: {
    marginBottom: 6,
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
  rapportsSection: {
    marginBottom: 12,
    gap: 6,
  },
  rapportTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#dcfce7',
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  rapportTagIcon: {
    fontSize: 14,
  },
  rapportTagText: {
    flex: 1,
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: '#15803d',
  },
  rapportTagCheck: {
    fontSize: 14,
    fontWeight: FontWeight.bold,
    color: '#15803d',
  },
});
