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
    Alert,
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
  const rapportAvant = rattachedRapports.find((r) => r.phase === 'Avant');
  const rapportApres = rattachedRapports.find((r) => r.phase === 'Après');
  const hasRapportAvant = !!rapportAvant;
  const hasRapportApres = !!rapportApres;

  const formatDate = (dateStr: string) => {
    const dt = new Date(dateStr);
    return `${dt.getDate().toString().padStart(2, '0')}/${(dt.getMonth() + 1).toString().padStart(2, '0')}/${String(dt.getFullYear()).slice(2)}`;
  };

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


      </View>

      {/* ─── Scrollable content ─── */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentPadding}
        showsVerticalScrollIndicator={false}
      >
        {/* Rapport avant tag */}
        {rapportAvant && (
          <TouchableOpacity
            style={styles.rapportTag}
            activeOpacity={0.7}
            onPress={() => Linking.openURL(auth.getPdfUrl(rapportAvant.id_rapport))}
          >
            <Text style={styles.rapportTagIcon}>📋</Text>
            <Text style={styles.rapportTagText}>
              Rapport Avant — {rapportAvant.reference_rapport}
            </Text>
            <Text style={styles.rapportTagCheck}>📄</Text>
          </TouchableOpacity>
        )}

        {/* Avant travaux */}
        <View style={styles.sectionTitle}>
          <View style={[styles.sectionDot, hasRapportAvant ? styles.dotGreen : styles.dotOrange]} />
          <Text style={styles.sectionLabel}>Photos avant travaux</Text>
        </View>
        <PhotoChecklist
          phase="avant"
          types={dossier.types}
          requirements={requirements}
          photos={dossierPhotos}
          checkedItems={avantChecked}
          onToggle={handleToggleAvant}
          locked={avantLocked}
          rapportRef={rapportAvant?.reference_rapport}
          rapportDate={rapportAvant ? formatDate(rapportAvant.date_creation) : undefined}
          rapportPdfUrl={rapportAvant ? auth.getPdfUrl(rapportAvant.id_rapport) : undefined}
          onStartCamera={async () => {
            try {
              const id = await auth.createRapport({
                phase: 'Avant',
                types: dossier.types.join(','),
                client_name: dossier.clientName,
                client_address: dossier.address,
                id_dossier: dossier.id,
              });
              if (!id) { Alert.alert('Erreur', 'Impossible de créer le rapport.'); return; }
              router.push({
                pathname: '/camera',
                params: {
                  dossierId: dossier.id,
                  phase: 'avant',
                  types: dossier.types.join(','),
                  clientName: dossier.clientName,
                  address: dossier.address,
                  rapportId: String(id),
                  requirementsJson: JSON.stringify(
                    requirements
                      .filter((r) => r.phase === 'avant')
                      .map((r) => ({ id: r.id_photo_requirement, label: r.label }))
                  ),
                },
              });
            } catch {
              Alert.alert('Erreur', 'Impossible de créer le rapport.');
            }
          }}
        />

        {/* Rapport après tag */}
        {rapportApres && (
          <TouchableOpacity
            style={[styles.rapportTag, { marginTop: 12 }]}
            activeOpacity={0.7}
            onPress={() => Linking.openURL(auth.getPdfUrl(rapportApres.id_rapport))}
          >
            <Text style={styles.rapportTagIcon}>📋</Text>
            <Text style={styles.rapportTagText}>
              Rapport Après — {rapportApres.reference_rapport}
            </Text>
            <Text style={styles.rapportTagCheck}>📄</Text>
          </TouchableOpacity>
        )}

        {/* Après travaux */}
        <View style={[styles.sectionTitle, { marginTop: 12 }]}>
          <View style={[styles.sectionDot, hasRapportApres ? styles.dotGreen : styles.dotOrange]} />
          <Text style={styles.sectionLabel}>Photos après travaux</Text>
        </View>
        <PhotoChecklist
          phase="apres"
          types={dossier.types}
          requirements={requirements}
          photos={dossierPhotos}
          checkedItems={apresChecked}
          onToggle={handleToggleApres}
          locked={apresLocked}
          rapportRef={rapportApres?.reference_rapport}
          rapportDate={rapportApres ? formatDate(rapportApres.date_creation) : undefined}
          rapportPdfUrl={rapportApres ? auth.getPdfUrl(rapportApres.id_rapport) : undefined}
          onStartCamera={async () => {
            try {
              const id = await auth.createRapport({
                phase: 'Après',
                types: dossier.types.join(','),
                client_name: dossier.clientName,
                client_address: dossier.address,
                id_dossier: dossier.id,
              });
              if (!id) { Alert.alert('Erreur', 'Impossible de créer le rapport.'); return; }
              router.push({
                pathname: '/camera',
                params: {
                  dossierId: dossier.id,
                  phase: 'apres',
                  types: dossier.types.join(','),
                  clientName: dossier.clientName,
                  address: dossier.address,
                  rapportId: String(id),
                  requirementsJson: JSON.stringify(
                    requirements
                      .filter((r) => r.phase === 'apres')
                      .map((r) => ({ id: r.id_photo_requirement, label: r.label }))
                  ),
                },
              });
            } catch {
              Alert.alert('Erreur', 'Impossible de créer le rapport.');
            }
          }}
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
  content: {
    flex: 1,
  },
  contentPadding: {
    padding: 14,
    paddingBottom: 40,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  sectionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotGreen: {
    backgroundColor: '#10b981',
  },
  dotOrange: {
    backgroundColor: '#f59e0b',
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
