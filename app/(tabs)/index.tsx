import { DossierCard } from '@/components/dossier-card';
import {
    FilterGroup,
    FilterOption,
    FiltersBar,
    FilterSeparator,
} from '@/components/filter-chips';
import { AppModal } from '@/components/ui/app-modal';
import { Avatar } from '@/components/ui/avatar';
import { Fab } from '@/components/ui/fab';
import { SearchBar } from '@/components/ui/search-bar';
import type { Dossier } from '@/constants/mock-data';
import { DOSSIERS_ARTISAN } from '@/constants/mock-data';
import { Colors, FontSize, FontWeight, Radius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/hooks/use-role';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const jeetyLogo = require('@/assets/images/splash-icon.png');

const STAGE_OPTIONS: FilterOption[] = [
  { value: 'tous', label: 'Tous' },
  { value: 'avant', label: 'Avant' },
  { value: 'apres', label: 'Après' },
  { value: 'ok', label: 'OK' },
];

const TYPE_OPTIONS: FilterOption[] = [
  { value: 'tous', label: 'Tous' },
  { value: 'PAC', label: 'PAC' },
  { value: 'BALLON', label: 'Ballon' },
  { value: 'ISOLATION', label: 'Isolation' },
  { value: 'CHAUDIERE', label: 'Chaudière' },
];

const POSEUR_OPTIONS: FilterOption[] = [
  { value: 'tous', label: 'Tous' },
  { value: 'interne', label: 'Interne' },
  { value: 'soustraite', label: 'Sous-traité' },
];

export default function ListScreen() {
  const router = useRouter();
  const auth = useAuth();
  const insets = useSafeAreaInsets();
  const { dossiers: apiDossiers } = auth;
  const { role, user } = useRole();
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('tous');
  const [typeFilter, setTypeFilter] = useState('tous');
  const [poseurFilter, setPoseurFilter] = useState('tous');
  const [affectModal, setAffectModal] = useState(false);
  const [selectedDossier, setSelectedDossier] = useState<Dossier | null>(null);

  // ─── Mode sélection multiple (affecter aux ouvriers) ─────────────────────
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [assignModal, setAssignModal] = useState(false);
  const [selectedOuvrier, setSelectedOuvrier] = useState<(typeof auth.teamOuvriers)[0] | null>(null);
  const [assigning, setAssigning] = useState(false);

  // Charger l'équipe au montage (pour le modal d'affectation)
  React.useEffect(() => {
    if (role === 'soustraitant') {
      auth.refreshTeam().catch(() => {});
    }
  }, [role]);

  // Pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await auth.refreshDossiers();
    setRefreshing(false);
  }, [auth]);

  const dossiers = useMemo(() => {
    if (apiDossiers.length > 0) return apiDossiers;
    if (role === 'artisan') return DOSSIERS_ARTISAN;
    return [];
  }, [role, apiDossiers]);

  const filtered = useMemo(() => {
    let list = dossiers;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.clientName.toLowerCase().includes(q) ||
          d.ref.toLowerCase().includes(q) ||
          d.address.toLowerCase().includes(q)
      );
    }
    if (stageFilter !== 'tous') {
      list = list.filter((d) => {
        if (stageFilter === 'avant') return d.avantStatus !== 'done';
        if (stageFilter === 'apres') return d.apresStatus !== 'done' && d.apresStatus !== 'locked';
        if (stageFilter === 'ok') return d.avantStatus === 'done' && d.apresStatus === 'done';
        return true;
      });
    }
    if (typeFilter !== 'tous') {
      list = list.filter((d) => d.types.includes(typeFilter as any));
    }
    if (poseurFilter !== 'tous') {
      list = list.filter((d) =>
        poseurFilter === 'soustraite' ? d.isSousTraite : !d.isSousTraite
      );
    }
    return list;
  }, [dossiers, search, stageFilter, typeFilter, poseurFilter]);

  const handleDossierPress = (dossier: Dossier) => {
    if (selectionMode) {
      setSelectedIds((prev) =>
        prev.includes(dossier.id) ? prev.filter((id) => id !== dossier.id) : [...prev, dossier.id]
      );
      return;
    }
    router.push({ pathname: '/detail', params: { id: dossier.id } });
  };

  const handleDossierLongPress = (dossier: Dossier) => {
    if (role !== 'soustraitant') return;
    if (!selectionMode) setSelectionMode(true);
    setSelectedIds((prev) =>
      prev.includes(dossier.id) ? prev : [...prev, dossier.id]
    );
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedIds([]);
    setSelectedOuvrier(null);
  };

  const handleConfirmAssign = async () => {
    if (!selectedOuvrier || selectedIds.length === 0) return;
    setAssigning(true);
    let ok = true;
    for (const id of selectedIds) {
      const success = await auth.assignOuvrier(id, selectedOuvrier.id_ouvrier);
      if (!success) ok = false;
    }
    setAssigning(false);
    setAssignModal(false);
    exitSelectionMode();
    if (ok) {
      await auth.refreshDossiers();
    } else {
      Alert.alert('Erreur', 'Certaines affectations ont échoué.');
    }
  };

  const headerTitle = role === 'soustraitant' ? 'Chantiers sous-traités' : role === 'ouvrier' ? 'Mes chantiers' : 'Mes dossiers';

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Header ── */}
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

        {/* Search */}
        <SearchBar
          value={search}
          onChangeText={setSearch}
          rightIcon={
            <TouchableOpacity style={styles.addUserBtn}>
              <Text style={{ fontSize: 18 }}>👤</Text>
            </TouchableOpacity>
          }
        />
      </View>

      {/* ── Filters sticky ── */}
      <FiltersBar>
        <FilterGroup
          label="ÉTAPE"
          options={STAGE_OPTIONS}
          activeValue={stageFilter}
          onSelect={setStageFilter}
        />
        <FilterSeparator />
        {role === 'artisan' && (
          <FilterGroup
            label="POSEUR"
            options={POSEUR_OPTIONS}
            activeValue={poseurFilter}
            onSelect={setPoseurFilter}
          />
        )}
        {role !== 'artisan' && (
          <FilterGroup
            label="TYPE"
            options={TYPE_OPTIONS}
            activeValue={typeFilter}
            onSelect={setTypeFilter}
            activeColor={Colors.green}
          />
        )}
      </FiltersBar>

      {/* ── Content ── */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.blue} colors={[Colors.blue]} />
        }
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{headerTitle}</Text>
          <View style={styles.sectionCount}>
            <Text style={styles.sectionCountText}>{filtered.length}</Text>
          </View>
        </View>

        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📂</Text>
            <Text style={styles.emptyText}>Aucun dossier trouvé</Text>
          </View>
        ) : (
          filtered.map((dossier) => {
            const isSelected = selectedIds.includes(dossier.id);
            return (
              <DossierCard
                key={dossier.id}
                dossier={dossier}
                role={role ?? 'artisan'}
                onPress={handleDossierPress}
                onLongPress={role === 'soustraitant' ? handleDossierLongPress : undefined}
                isSelected={selectionMode && isSelected}
              />
            );
          })
        )}

        {/* Bottom padding for FAB */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* ── FAB ── */}
      <Fab onPress={() => router.push('/create')} />

      {/* ── Hint long press (sous-traitant, hors mode sélection) ── */}
      {role === 'soustraitant' && !selectionMode && (
        <View style={styles.longPressHint}>
          <Text style={styles.longPressHintText}>Appui long sur un dossier pour affecter un ouvrier</Text>
        </View>
      )}

      {/* ── Barre d'action sélection ── */}
      {selectionMode && selectedIds.length > 0 && (
        <View style={styles.selectionBar}>
          <Text style={styles.selectionBarText}>{selectedIds.length} sélectionné(s)</Text>
          <TouchableOpacity style={styles.selectionBarBtn} onPress={() => setAssignModal(true)} activeOpacity={0.85}>
            <Text style={styles.selectionBarBtnText}>👤 Affecter</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.selectionBarClose} onPress={exitSelectionMode}>
            <Text style={styles.selectionBarCloseText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Modal Affecter à un ouvrier ── */}
      <Modal visible={assignModal} transparent animationType="slide" onRequestClose={() => setAssignModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setAssignModal(false)}>
          <Pressable style={[styles.assignModalCard, { paddingBottom: Math.max(insets.bottom + 16, 24) }]} onPress={() => {}}>
            <Text style={styles.assignModalTitle}>Affecter à un ouvrier</Text>
            <Text style={styles.assignModalSub}>{selectedIds.length} dossier(s) sélectionné(s)</Text>

            {auth.teamOuvriers.map((ouvrier) => {
              const isChosen = selectedOuvrier?.id_ouvrier === ouvrier.id_ouvrier;
              return (
                <TouchableOpacity
                  key={ouvrier.id_ouvrier}
                  style={[styles.ouvrierRow, isChosen && styles.ouvrierRowSelected]}
                  onPress={() => setSelectedOuvrier(isChosen ? null : ouvrier)}
                  activeOpacity={0.8}
                >
                  <Avatar
                    initials={((ouvrier.prenom?.[0] ?? '') + (ouvrier.nom?.[0] ?? '')).toUpperCase() || 'OV'}
                    size={40}
                    backgroundColor={Colors.blue}
                    borderRadius={20}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.ouvrierName}>{ouvrier.prenom} {ouvrier.nom}</Text>
                    <Text style={styles.ouvrierRole}>Ouvrier</Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Warning réaffectation */}
            {selectedOuvrier && selectedIds.length === 1 && (() => {
              const dossier = filtered.find(d => d.id === selectedIds[0]);
              if (!dossier) return null;
              const ouvrierName = selectedOuvrier.prenom + ' ' + selectedOuvrier.nom;
              const shortName = (selectedOuvrier.prenom?.[0] ?? '') + '. ' + (selectedOuvrier.nom ?? '');
              if (dossier.assignedTo && dossier.assignedTo !== ouvrierName) {
                const oldShort = dossier.assignedTo.split(' ')[0][0] + '. ' + dossier.assignedTo.split(' ').slice(1).join(' ');
                return (
                  <View style={styles.warningBox}>
                    <Text style={styles.warningText}>
                      {dossier.ref} sera réattribué de <Text style={{ fontWeight: '700' }}>{dossier.assignedTo}</Text> à <Text style={{ fontWeight: '700' }}>{shortName}</Text>
                    </Text>
                  </View>
                );
              }
              if (dossier.assignedTo) {
                return (
                  <View style={styles.warningBox}>
                    <Text style={styles.warningText}>{dossier.ref} est affecté à <Text style={{ fontWeight: '700' }}>{dossier.assignedTo}</Text></Text>
                  </View>
                );
              }
              return null;
            })()}

            <View style={styles.assignModalFooter}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnOutline]} onPress={() => setAssignModal(false)}>
                <Text style={styles.modalBtnOutlineText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnPrimary, (!selectedOuvrier || assigning) && { opacity: 0.5 }]}
                onPress={handleConfirmAssign}
                disabled={!selectedOuvrier || assigning}
              >
                <Text style={styles.modalBtnPrimaryText}>{assigning ? '...' : 'Affecter'}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.gray50 },
  header: {
    backgroundColor: Colors.blue,
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  headerLogo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  focusIconImg: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
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
  addUserBtn: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1 },
  contentInner: { padding: 14 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.gray800,
  },
  sectionCount: {
    backgroundColor: Colors.gray200,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.round,
  },
  sectionCountText: {
    fontSize: FontSize.base,
    color: Colors.gray500,
    fontWeight: FontWeight.medium,
  },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: FontSize.xl, color: Colors.gray400, fontWeight: FontWeight.medium },
  // Modal
  modalDesc: {
    fontSize: FontSize.base,
    color: Colors.gray600,
    lineHeight: 18,
    marginBottom: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
  modalBtnOutline: { borderWidth: 2, borderColor: Colors.gray200 },
  modalBtnPrimary: { backgroundColor: Colors.blue },
  modalBtnOutlineText: { color: Colors.gray700, fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  modalBtnPrimaryText: { color: Colors.white, fontSize: FontSize.md, fontWeight: FontWeight.bold },

  // Hint long press
  longPressHint: {
    backgroundColor: '#eff6ff',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  longPressHintText: {
    fontSize: FontSize.xs,
    color: Colors.blue,
    textAlign: 'center',
  },

  // Carte sélectionnée
  cardSelected: {
    borderRadius: Radius.xl,
    borderWidth: 2,
    borderColor: Colors.blue,
    marginBottom: 2,
  },

  // Barre d'action en bas
  selectionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.blue,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  selectionBarText: { flex: 1, color: Colors.white, fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  selectionBarBtn: {
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.md,
  },
  selectionBarBtnText: { color: Colors.blue, fontSize: FontSize.base, fontWeight: FontWeight.bold },
  selectionBarClose: { padding: 6 },
  selectionBarCloseText: { color: Colors.white, fontSize: FontSize.xl, fontWeight: FontWeight.bold },

  // Modal affecter ouvrier
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  assignModalCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    gap: 12,
  },
  assignModalTitle: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.gray800 },
  assignModalSub: { fontSize: FontSize.base, color: Colors.gray500, marginBottom: 4 },
  ouvrierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: Colors.gray100,
    backgroundColor: Colors.gray50,
  },
  ouvrierRowSelected: {
    borderColor: Colors.blue,
    backgroundColor: '#eff6ff',
  },
  ouvrierName: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.gray800 },
  ouvrierRole: { fontSize: FontSize.sm, color: Colors.gray500 },
  warningBox: {
    backgroundColor: '#fef3c7',
    borderRadius: Radius.md,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  warningText: { fontSize: FontSize.base, color: '#92400e' },
  assignModalFooter: { flexDirection: 'row', gap: 10, marginTop: 8 },
});
