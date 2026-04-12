import {
  FilterGroup,
  FilterSeparator,
  FiltersBar,
} from '@/components/filter-chips';
import { AppModal } from '@/components/ui/app-modal';
import { Avatar } from '@/components/ui/avatar';
import { TypeBadge } from '@/components/ui/badge';
import { Fab } from '@/components/ui/fab';
import { SearchBar } from '@/components/ui/search-bar';
import { Toast } from '@/components/ui/toast';
import type { Dossier, DossierType, RapportLibre } from '@/constants/mock-data';
import { RAPPORTS_LIBRES } from '@/constants/mock-data';
import { Colors, FontSize, FontWeight, Radius, Shadows } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/hooks/use-role';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const jeetyLogo = require('@/assets/images/splash-icon.png');

// ─── Filter options ───────────────────────────────────────────────────────────

const TYPE_OPTIONS = [
  { value: 'tous', label: 'Tous' },
  { value: 'Avant', label: 'Avant' },
  { value: 'Après', label: 'Après' },
];

const POSEUR_OPTIONS = [
  { value: 'tous', label: 'Tous' },
  { value: 'interne', label: 'Interne' },
  { value: 'soustraite', label: 'Sous-traité' },
];

// ─── Rapport Card (maquette) ──────────────────────────────────────────────────

function RapportCard({
  rapport,
  onRattacher,
}: {
  rapport: RapportLibre;
  onRattacher: (r: RapportLibre) => void;
}) {
  const phaseLabel = rapport.phase === 'Avant' ? 'Avant travaux' : 'Après travaux';

  return (
    <View
      style={styles.card}
    >
      {/* Row 1: dash + type badges */}
      <View style={styles.cardTopRow}>
        <View style={styles.cardDash} />
        <View style={styles.cardBadges}>
          {rapport.types.map((t) => (
            <TypeBadge key={t} type={t} />
          ))}
        </View>
      </View>

      {/* Client name & address */}
      <Text style={styles.cardName} numberOfLines={1}>{rapport.clientName}</Text>
      <Text style={styles.cardAddress} numberOfLines={1}>{rapport.address}</Text>

      {/* Phase row: green check + phase + ref + date */}
      <View style={styles.phaseRow}>
        <View style={styles.greenCheck}>
          <Text style={styles.greenCheckText}>✓</Text>
        </View>
        <View style={styles.phaseInfo}>
          <View style={styles.phaseLineTop}>
            <Text style={styles.phaseIcon}>📋</Text>
            <Text style={styles.phaseLabel}>{phaseLabel}</Text>
          </View>
          <Text style={styles.phaseDetail}>{rapport.ref} • {rapport.date}</Text>
        </View>
      </View>

      {/* Assigned to */}
      {rapport.assignedTo && (
        <View style={styles.assignedRow}>
          <Text style={styles.assignedIcon}>👤</Text>
          <Text style={styles.assignedText}>{rapport.assignedTo}</Text>
        </View>
      )}

      {/* Via (sous-traitant) */}
      {rapport.via && (
        <View style={styles.viaBadge}>
          <Text style={styles.viaBadgeText}>{rapport.via}</Text>
        </View>
      )}

      {/* Rattacher button */}
      <TouchableOpacity
        style={styles.rattacherBtn}
        onPress={() => onRattacher(rapport)}
        activeOpacity={0.7}
      >
        <Text style={styles.rattacherIcon}>🔗</Text>
        <Text style={styles.rattacherText}>Rattacher à un dossier CEE</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function RapportsScreen() {
  const router = useRouter();
  const { role, user } = useRole();
  const auth = useAuth();
  const [search, setSearch] = useState('');
  const [phaseFilter, setPhaseFilter] = useState('tous');
  const [poseurFilter, setPoseurFilter] = useState('tous');

  // Rattachement modal
  const [rattachModal, setRattachModal] = useState(false);
  const [rattachRapport, setRattachRapport] = useState<RapportLibre | null>(null);
  const [refInput, setRefInput] = useState('');

  // Toast
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2500);
  };

  // Pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([auth.refreshRapports(), auth.refreshDossiers()]);
    setRefreshing(false);
  }, [auth]);

  // Refresh rapports on mount
  useEffect(() => {
    auth.refreshRapports();
    auth.refreshDossiers();
  }, []);

  // Map API rapports to RapportLibre format, fallback to mock
  // Only show rapports libres = those NOT attached to a dossier (id_dossier is null)
  const rapportsList: RapportLibre[] = useMemo(() => {
    if (auth.rapports.length > 0) {
      return auth.rapports
        .filter((r) => !r.id_dossier)
        .map((r) => {
          const dateStr = r.date_creation
            ? new Date(r.date_creation).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })
            : '';
          return {
            id: String(r.id_rapport),
            ref: r.reference_rapport,
            clientName: r.client_name || 'Sans nom',
            address: r.client_address || '',
            types: (r.types || []) as DossierType[],
            phase: r.phase,
            date: dateStr,
            via: r.via || undefined,
            assignedTo: undefined,
          };
        });
    }
    return RAPPORTS_LIBRES;
  }, [auth.rapports]);

  const filtered = useMemo(() => {
    let list = rapportsList;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.clientName.toLowerCase().includes(q) ||
          r.ref.toLowerCase().includes(q) ||
          r.address.toLowerCase().includes(q)
      );
    }
    if (phaseFilter !== 'tous') {
      list = list.filter((r) => r.phase === phaseFilter);
    }
    if (poseurFilter === 'interne') {
      list = list.filter((r) => !r.via);
    } else if (poseurFilter === 'soustraite') {
      list = list.filter((r) => !!r.via);
    }
    return list;
  }, [search, phaseFilter, poseurFilter, rapportsList]);

  // Dossiers déjà rattachés (par phase) — pour filtrer l'autocomplete
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

  // Dossiers suggestions for rattachement (exclure ceux qui ont déjà un rapport de la même phase)
  const dossierSuggestions = useMemo(() => {
    if (!refInput.trim() || !rattachRapport) return [];
    const q = refInput.toLowerCase();
    const rapportPhase = rattachRapport.phase || 'Avant';
    return auth.dossiers
      .filter((d: Dossier) => {
        if (!d.ref.toLowerCase().includes(q)) return false;
        const phases = dossiersWithPhase[d.id];
        if (phases && phases.has(rapportPhase)) return false;
        return true;
      })
      .slice(0, 5);
  }, [refInput, auth.dossiers, rattachRapport, dossiersWithPhase]);

  const handleOpenRattach = (rapport: RapportLibre) => {
    setRattachRapport(rapport);
    setRefInput('');
    setRattachModal(true);
  };

  const handleRattacher = () => {
    if (!rattachRapport || !refInput.trim()) return;
    // Find the matching dossier
    const dossier = auth.dossiers.find(
      (d: Dossier) => d.ref.toLowerCase() === refInput.trim().toLowerCase()
    );
    auth.apiAction(
      {
        action: 'attach-rapport',
        token: auth.usertoken,
        id_rapport: rattachRapport.id,
        reference_dossier: refInput.trim(),
        id_dossier: dossier?.id || null,
      },
      () => {
        setRattachModal(false);
        setRattachRapport(null);
        setRefInput('');
        // Rafraîchir les deux listes puis afficher le toast
        Promise.all([auth.refreshRapports(), auth.refreshDossiers()]).then(() => {
          showToast('Rapport rattaché au dossier ' + refInput.trim() + ' ✓');
        });
      },
      (msg) => {
        showToast(msg || 'Erreur lors du rattachement', 'error');
      },
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLogo}>
            <Image source={jeetyLogo} style={styles.focusIconImg} />
            <Text style={styles.logoText}>Jeety Focus</Text>
          </View>
          <View style={styles.headerUser}>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.userName}>
                {user?.firstName} {user?.lastName}
              </Text>
              <Text style={styles.userCompany}>{user?.company}</Text>
            </View>
            <Avatar initials={user?.initials ?? 'JD'} size={32} backgroundColor={Colors.pink} borderRadius={10} />
          </View>
        </View>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Rechercher..." />
      </View>

      {/* Filters: TYPE + POSEUR */}
      <FiltersBar>
        <FilterGroup
          label="TYPE"
          options={TYPE_OPTIONS}
          activeValue={phaseFilter}
          onSelect={setPhaseFilter}
        />
        <FilterSeparator />
        <FilterGroup
          label="POSEUR"
          options={POSEUR_OPTIONS}
          activeValue={poseurFilter}
          onSelect={setPoseurFilter}
        />
      </FiltersBar>

      {/* List */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.blue} colors={[Colors.blue]} />
        }
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Rapports libres</Text>
          <View style={styles.sectionCount}>
            <Text style={styles.sectionCountText}>{filtered.length}</Text>
          </View>
        </View>

        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>Aucun rapport trouvé</Text>
          </View>
        ) : (
          filtered.map((rapport) => (
            <RapportCard
              key={rapport.id}
              rapport={rapport}
              onRattacher={handleOpenRattach}
            />
          ))
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      <Fab onPress={() => router.push('/create')} />

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
  safeArea: { flex: 1, backgroundColor: Colors.gray50 },
  header: { backgroundColor: Colors.blue, paddingHorizontal: 14, paddingBottom: 14 },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  headerLogo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  focusIconImg: { width: 28, height: 28, borderRadius: 6 },
  logoText: { fontSize: FontSize['3xl'], fontWeight: FontWeight.extrabold, color: Colors.white },
  headerUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 4,
    paddingLeft: 10,
    paddingRight: 6,
    borderRadius: 20,
  },
  userName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.white,
    lineHeight: 14,
  },
  userCompany: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 12,
  },
  // Content
  content: { flex: 1 },
  contentInner: { padding: 14 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.gray800 },
  sectionCount: { backgroundColor: Colors.gray200, paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.round },
  sectionCountText: { fontSize: FontSize.base, color: Colors.gray500, fontWeight: FontWeight.medium },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: FontSize.xl, color: Colors.gray400, fontWeight: FontWeight.medium },
  // ─── Cards (maquette) ──────────────────────────────────────────────────────
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: 14,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    ...Shadows.sm,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardDash: {
    width: 24,
    height: 3,
    backgroundColor: Colors.gray800,
    borderRadius: 2,
  },
  cardBadges: {
    flexDirection: 'row',
    gap: 4,
  },
  cardName: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: Colors.gray800,
    marginBottom: 2,
  },
  cardAddress: {
    fontSize: FontSize.base,
    color: Colors.gray500,
    marginBottom: 10,
  },
  // Phase row
  phaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.gray50,
    borderRadius: Radius.lg,
    padding: 10,
    marginBottom: 8,
  },
  greenCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greenCheckText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: FontWeight.extrabold,
  },
  phaseInfo: { flex: 1 },
  phaseLineTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  phaseIcon: { fontSize: 12 },
  phaseLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.gray800,
  },
  phaseDetail: {
    fontSize: FontSize.sm,
    color: Colors.gray500,
  },
  // Assigned
  assignedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  assignedIcon: { fontSize: 12 },
  assignedText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.blue,
  },
  // Via badge
  viaBadge: {
    backgroundColor: '#dcfce7',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    marginBottom: 8,
  },
  viaBadgeText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: '#15803d',
  },
  // Rattacher button
  rattacherBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    marginTop: 8,
    backgroundColor: Colors.blue,
    borderRadius: Radius.md,
  },
  rattacherIcon: { fontSize: 14 },
  rattacherText: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  // ─── Modal ─────────────────────────────────────────────────────────────────
  modalDesc: {
    fontSize: FontSize.base,
    color: Colors.gray500,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.gray700,
    marginBottom: 4,
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: Colors.gray200,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: FontSize.lg,
    color: Colors.gray800,
    backgroundColor: Colors.white,
  },
  suggestions: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  suggestionRef: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.blue,
  },
  suggestionName: {
    fontSize: FontSize.sm,
    color: Colors.gray500,
    flex: 1,
  },
  // Modal buttons
  modalBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnOutline: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
  },
  modalBtnOutlineText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.gray600,
  },
  modalBtnPrimary: {
    backgroundColor: Colors.green,
  },
  modalBtnDisabled: {
    opacity: 0.5,
  },
  modalBtnPrimaryText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
});
