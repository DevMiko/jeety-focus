import { Avatar } from '@/components/ui/avatar';
import { InfoBox } from '@/components/ui/info-box';
import type { TeamMember } from '@/constants/mock-data';
import { OUVRIERS, OUVRIERS_ST } from '@/constants/mock-data';
import { Colors, FontSize, FontWeight, Radius, Shadows } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/hooks/use-role';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const AVATAR_COLORS = [Colors.blue, Colors.pink, Colors.green, Colors.orange, '#8b5cf6', '#0ea5e9'];

export default function OuvriersScreen() {
  const router = useRouter();
  const { role } = useRole();
  const auth = useAuth();

  useEffect(() => {
    auth.refreshTeam().catch(() => {});
  }, []);

  const ouvriersList: TeamMember[] = useMemo(() => {
    const fallback = role === 'soustraitant' ? OUVRIERS_ST : OUVRIERS;
    if (auth.teamOuvriers.length === 0) return fallback;
    return auth.teamOuvriers.map((o) => ({
      id: String(o.id_ouvrier),
      firstName: o.prenom,
      lastName: o.nom,
      initials: ((o.prenom?.[0] || '') + (o.nom?.[0] || '')).toUpperCase(),
      phone: o.telephone,
      status: o.status as 'active' | 'pending',
      hasJeety: !!o.has_jeety,
      rapportCount: undefined,
    }));
  }, [auth.teamOuvriers, role]);

  const handleInvite = async (m: TeamMember) => {
    Alert.alert('Invitation', `Renvoyer une invitation SMS à ${m.firstName} ${m.lastName} ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Envoyer',
        onPress: async () => {
          const success = await auth.inviteMember('ouvrier', m.id);
          Alert.alert(
            'Envoyé ✓',
            success
              ? `SMS d'invitation renvoyé à ${m.firstName} ${m.lastName}.`
              : `L'invitation sera envoyée dès que la connexion sera rétablie.`
          );
        },
      },
    ]);
  };

  const handleRemove = (m: TeamMember) => {
    Alert.alert('Retirer', `Retirer ${m.firstName} ${m.lastName} de votre équipe ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Retirer',
        style: 'destructive',
        onPress: async () => {
          const success = await auth.removeOuvrier(m.id);
          if (success) {
            Alert.alert('Retiré ✓', `${m.firstName} ${m.lastName} a été retiré.`);
          } else {
            Alert.alert('Info', 'La demande sera traitée dès que la connexion sera rétablie.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.screen}>
      {/* ─── Header ─── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>‹ Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes ouvriers</Text>
        <Text style={styles.headerSubtitle}>Accès photo pour votre équipe</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentPadding}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Info Card ─── */}
        <InfoBox
          variant="info"
          icon="👷"
          text="Accès ouvrier — Vos ouvriers peuvent prendre des photos de chantier directement depuis Jeety Focus. Les photos sont automatiquement rattachées à vos dossiers."
        />

        {/* ─── Ouvrier List ─── */}
        {ouvriersList.map((m, index) => {
          const isActive = m.status === 'active';
          const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];
          return (
            <View key={m.id} style={[styles.memberCard, !isActive && styles.memberCardPending]}>
              <Avatar
                initials={m.initials}
                size={44}
                backgroundColor={avatarColor}
                borderRadius={Radius.round}
              />
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{m.firstName} {m.lastName}</Text>
                <Text style={styles.memberPhone}>{m.phone}</Text>
                <Text style={[styles.memberStatus, isActive ? styles.statusActive : styles.statusPending]}>
                  {isActive ? `Actif${m.rapportCount !== undefined ? ` • ${m.rapportCount} rapports` : ''}` : '⏳ Invitation envoyée'}
                </Text>
              </View>
              <View style={styles.memberActions}>
                {!isActive && (
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handleInvite(m)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.actionIcon}>📨</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleRemove(m)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.actionIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {ouvriersList.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Aucun ouvrier dans votre équipe</Text>
            <Text style={styles.emptySubtext}>Ajoutez votre premier ouvrier pour lui donner accès aux photos de chantier.</Text>
          </View>
        )}
      </ScrollView>

      {/* ─── Add Button ─── */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/add-ouvrier')}
          activeOpacity={0.85}
        >
          <Text style={styles.addBtnText}>+ Ajouter un ouvrier</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.gray50 },

  // Header
  header: {
    backgroundColor: Colors.blue,
    paddingHorizontal: 14,
    paddingBottom: 18,
  },
  backBtn: { paddingVertical: 10 },
  backText: { color: Colors.white, fontSize: FontSize.xl, fontWeight: FontWeight.medium },
  headerTitle: {
    fontSize: FontSize['3xl'],
    fontWeight: FontWeight.extrabold,
    color: Colors.white,
  },
  headerSubtitle: {
    fontSize: FontSize.md,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },

  // Content
  content: { flex: 1 },
  contentPadding: { padding: 14, paddingBottom: 100 },

  // Member card
  memberCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
    ...Shadows.sm,
  },
  memberCardPending: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.gray300,
    ...({ shadowOpacity: 0 } as any),
    elevation: 0,
  },
  memberInfo: { flex: 1 },
  memberName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.gray800,
  },
  memberPhone: {
    fontSize: FontSize.sm,
    color: Colors.gray500,
    marginTop: 2,
  },
  memberStatus: {
    fontSize: FontSize.sm,
    marginTop: 2,
    fontWeight: FontWeight.medium,
  },
  statusActive: { color: Colors.green },
  statusPending: { color: Colors.orange },

  // Actions
  memberActions: {
    flexDirection: 'row',
    gap: 6,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Colors.gray50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: { fontSize: 16 },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: Colors.gray600,
  },
  emptySubtext: {
    fontSize: FontSize.md,
    color: Colors.gray400,
    textAlign: 'center',
    marginTop: 6,
  },

  // Bottom bar
  bottomBar: {
    padding: 14,
    paddingBottom: 20,
    backgroundColor: Colors.gray50,
  },
  addBtn: {
    backgroundColor: Colors.pink,
    borderRadius: Radius.xl,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addBtnText: {
    color: Colors.white,
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
  },
});
