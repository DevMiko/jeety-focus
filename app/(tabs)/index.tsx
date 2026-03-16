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
import {
    DOSSIERS_ARTISAN,
    DOSSIERS_OUVRIER,
    DOSSIERS_SOUSTRAITANT,
} from '@/constants/mock-data';
import { Colors, FontSize, FontWeight, Radius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/hooks/use-role';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  const { dossiers: apiDossiers } = useAuth();
  const { role, user } = useRole();
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('tous');
  const [typeFilter, setTypeFilter] = useState('tous');
  const [poseurFilter, setPoseurFilter] = useState('tous');
  const [affectModal, setAffectModal] = useState(false);
  const [selectedDossier, setSelectedDossier] = useState<Dossier | null>(null);

  const dossiers = useMemo(() => {
    if (apiDossiers.length > 0) return apiDossiers;
    if (role === 'soustraitant') return DOSSIERS_SOUSTRAITANT;
    if (role === 'ouvrier') return DOSSIERS_OUVRIER;
    return DOSSIERS_ARTISAN;
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
    return list;
  }, [dossiers, search, stageFilter, typeFilter]);

  const handleDossierPress = (dossier: Dossier) => {
    router.push({ pathname: '/detail', params: { id: dossier.id } });
  };

  const headerTitle = role === 'ouvrier' ? 'Mes chantiers' : 'Mes dossiers';

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLogo}>
            <View style={styles.focusIcon}>
              <Text style={styles.focusIconText}>📷</Text>
            </View>
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
          filtered.map((dossier) => (
            <DossierCard
              key={dossier.id}
              dossier={dossier}
              role={role ?? 'artisan'}
              onPress={handleDossierPress}
            />
          ))
        )}

        {/* Bottom padding for FAB */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* ── FAB ── */}
      <Fab onPress={() => router.push('/create')} />

      {/* ── Modal Affectation (artisan/ST) ── */}
      {selectedDossier && (
        <AppModal
          visible={affectModal}
          onClose={() => setAffectModal(false)}
          title="Affecter un intervenant"
          footer={
            <>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnOutline]}
                onPress={() => setAffectModal(false)}
              >
                <Text style={styles.modalBtnOutlineText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnPrimary]}
                onPress={() => setAffectModal(false)}
              >
                <Text style={styles.modalBtnPrimaryText}>Confirmer</Text>
              </TouchableOpacity>
            </>
          }
        >
          <Text style={styles.modalDesc}>
            Sélectionnez un ouvrier ou sous-traitant à affecter sur ce dossier.
          </Text>
        </AppModal>
      )}
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
  focusIcon: {
    width: 28,
    height: 28,
    backgroundColor: Colors.pink,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusIconText: { fontSize: 16 },
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
});
