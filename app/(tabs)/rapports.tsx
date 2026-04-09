import { Avatar } from '@/components/ui/avatar';
import { TypeBadge } from '@/components/ui/badge';
import { Fab } from '@/components/ui/fab';
import { SearchBar } from '@/components/ui/search-bar';
import type { DossierType, RapportLibre } from '@/constants/mock-data';
import { RAPPORTS_LIBRES } from '@/constants/mock-data';
import { Colors, FontSize, FontWeight, Radius, Shadows } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/hooks/use-role';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const jeetyLogo = require('@/assets/images/splash-icon.png');

function RapportCard({
  rapport,
  onPress,
}: {
  rapport: RapportLibre;
  onPress: (r: RapportLibre) => void;
}) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(rapport)}
      activeOpacity={0.85}
    >
      <View style={styles.cardTop}>
        <View style={styles.cardInfo}>
          <Text style={styles.cardRef}>{rapport.ref}</Text>
          <Text style={styles.cardName} numberOfLines={1}>{rapport.clientName}</Text>
          <Text style={styles.cardAddress} numberOfLines={1}>{rapport.address}</Text>
        </View>
        <View style={styles.cardRight}>
          {rapport.types.map((t) => (
            <TypeBadge key={t} type={t} />
          ))}
        </View>
      </View>
      <View style={styles.cardMeta}>
        <View style={[styles.phaseBadge, rapport.phase === 'Avant' ? styles.phaseAvant : styles.phaseApres]}>
          <Text style={[styles.phaseText, rapport.phase === 'Avant' ? styles.phaseTextAvant : styles.phaseTextApres]}>
            {rapport.phase}
          </Text>
        </View>
        <Text style={styles.cardDate}>📅 {rapport.date}</Text>
        {rapport.via && (
          <Text style={styles.cardVia}>via {rapport.via}</Text>
        )}
        {rapport.assignedTo && (
          <Text style={styles.cardAssigned}>👤 {rapport.assignedTo}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function RapportsScreen() {
  const router = useRouter();
  const { role, user } = useRole();
  const auth = useAuth();
  const [search, setSearch] = useState('');
  const [phaseFilter, setPhaseFilter] = useState<'tous' | 'Avant' | 'Après'>('tous');

  // Refresh rapports on mount
  useEffect(() => {
    auth.refreshRapports();
  }, []);

  // Map API rapports to RapportLibre format, fallback to mock
  const rapportsList: RapportLibre[] = useMemo(() => {
    if (auth.rapports.length > 0) {
      return auth.rapports.map((r) => {
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
    return list;
  }, [search, phaseFilter, rapportsList]);

  const handlePress = (rapport: RapportLibre) => {
    router.push({ pathname: '/detail', params: { id: rapport.id, type: 'rapport' } });
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
          <Avatar initials={user?.initials ?? 'JD'} size={32} backgroundColor={Colors.pink} borderRadius={10} />
        </View>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Rechercher un rapport..." />
      </View>

      {/* Phase filter */}
      <View style={styles.phaseFilters}>
        {(['tous', 'Avant', 'Après'] as const).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.phaseChip, phaseFilter === p && styles.phaseChipActive]}
            onPress={() => setPhaseFilter(p)}
          >
            <Text style={[styles.phaseChipText, phaseFilter === p && styles.phaseChipTextActive]}>
              {p === 'tous' ? 'Tous' : p}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Rapports libres</Text>
          <View style={styles.sectionCount}>
            <Text style={styles.sectionCountText}>{filtered.length}</Text>
          </View>
        </View>

        {filtered.map((rapport) => (
          <RapportCard key={rapport.id} rapport={rapport} onPress={handlePress} />
        ))}

        <View style={{ height: 80 }} />
      </ScrollView>

      <Fab onPress={() => router.push('/create')} />
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
  // Phase filters
  phaseFilters: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: Colors.gray50,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  phaseChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.round,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
  },
  phaseChipActive: { backgroundColor: Colors.blue, borderColor: Colors.blue },
  phaseChipText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.gray600 },
  phaseChipTextActive: { color: Colors.white },
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
  // Cards
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    ...Shadows.sm,
  },
  cardTop: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  cardInfo: { flex: 1 },
  cardRef: { fontSize: FontSize.sm, fontWeight: FontWeight.extrabold, color: Colors.blue, marginBottom: 2 },
  cardName: { fontSize: FontSize.xl, fontWeight: FontWeight.semibold, color: Colors.gray800 },
  cardAddress: { fontSize: FontSize.base, color: Colors.gray500, marginTop: 1 },
  cardRight: { flexDirection: 'column', gap: 3, alignItems: 'flex-end' },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
    flexWrap: 'wrap',
  },
  phaseBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.xs },
  phaseAvant: { backgroundColor: '#e0f2fe' },
  phaseApres: { backgroundColor: '#dcfce7' },
  phaseText: { fontSize: FontSize.sm, fontWeight: FontWeight.extrabold },
  phaseTextAvant: { color: '#0369a1' },
  phaseTextApres: { color: '#15803d' },
  cardDate: { fontSize: FontSize.sm, color: Colors.gray500 },
  cardVia: { fontSize: FontSize.sm, color: Colors.gray400, fontStyle: 'italic' },
  cardAssigned: { fontSize: FontSize.sm, color: Colors.gray500 },
});
