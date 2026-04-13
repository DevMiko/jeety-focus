import { Avatar } from '@/components/ui/avatar';
import { InfoBox } from '@/components/ui/info-box';
import type { SousTraitant } from '@/constants/mock-data';
import { SOUS_TRAITANTS } from '@/constants/mock-data';
import { Colors, FontSize, FontWeight, Radius, Shadows } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
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

const AVATAR_COLORS = ['#00965E', '#0ea5e9', '#8b5cf6', Colors.orange, Colors.pink, Colors.blue];

export default function SousTraitantsScreen() {
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    auth.refreshTeam().catch(() => {});
  }, []);

  const stList: SousTraitant[] = useMemo(() => {
    if (auth.teamSousTraitants.length === 0) return SOUS_TRAITANTS;
    return auth.teamSousTraitants.map((st) => ({
      id: String(st.id_sous_traitant),
      name: st.company_name,
      siret: st.siret,
      hasJeety: !!st.has_jeety,
      rapportCount: st.rapport_count,
    }));
  }, [auth.teamSousTraitants]);

  const handleInvite = async (st: SousTraitant) => {
    const success = await auth.inviteMember('sous-traitant', st.id);
    Alert.alert(
      'Envoyé ✓',
      success
        ? `Invitation envoyée à ${st.name}.`
        : `L'invitation sera envoyée dès que la connexion sera rétablie.`
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      {/* ─── Header ─── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>‹ Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes sous-traitants</Text>
        <Text style={styles.headerSubtitle}>Liés via SIRET depuis le CRM Jeety</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentPadding}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── SIRET Info Card ─── */}
        <InfoBox
          variant="success"
          icon="🔗"
          text="Liaison automatique via SIRET — Les sous-traitants sont liés automatiquement via leur SIRET enregistré dans votre CRM Jeety."
        />

        {/* ─── ST List ─── */}
        {stList.map((st, index) => {
          const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];
          return (
            <View key={st.id} style={styles.stCard}>
              <Avatar
                initials={st.name.slice(0, 2).toUpperCase()}
                size={44}
                backgroundColor={avatarColor}
                borderRadius={Radius.md}
              />
              <View style={styles.stInfo}>
                <Text style={styles.stName}>{st.name}</Text>
                <Text style={styles.stSiret}>SIRET : {st.siret}</Text>
                {st.hasJeety && (
                  <View style={styles.jeetyBadge}>
                    <Text style={styles.jeetyText}>✓ Jeety</Text>
                    {st.rapportCount !== undefined && (
                      <Text style={styles.jeetyCount}> • {st.rapportCount} rapports</Text>
                    )}
                  </View>
                )}
              </View>
              {!st.hasJeety ? (
                <TouchableOpacity
                  style={styles.inviteBtn}
                  onPress={() => handleInvite(st)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.inviteBtnText}>Inviter</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.jeetyBadgeLg}>
                  <Text style={styles.jeetyBadgeLgText}>✓ Jeety</Text>
                </View>
              )}
            </View>
          );
        })}

        {stList.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Aucun sous-traitant</Text>
            <Text style={styles.emptySubtext}>Les sous-traitants seront liés automatiquement via leur SIRET depuis votre CRM Jeety.</Text>
          </View>
        )}

        {/* ─── "Comment ça marche ?" ─── */}
        <View style={{ marginTop: 16 }}>
          <InfoBox
            variant="warning"
            icon="💡"
            text="Comment ça marche ? — Les sous-traitants sont liés automatiquement quand leur numéro SIRET est enregistré dans votre CRM Jeety. Vous n'avez rien à faire manuellement. S'ils utilisent déjà Jeety Focus, le badge vert « Jeety » apparaît."
          />
        </View>
      </ScrollView>
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
  contentPadding: { padding: 14, paddingBottom: 40 },

  // ST card
  stCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: 14,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...Shadows.sm,
  },
  stInfo: { flex: 1, gap: 2 },
  stName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.gray800,
  },
  stSiret: {
    fontSize: FontSize.sm,
    color: Colors.gray500,
    fontFamily: 'monospace',
  },

  // Jeety inline badge
  jeetyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  jeetyText: {
    fontSize: FontSize.sm,
    color: Colors.green,
    fontWeight: FontWeight.semibold,
  },
  jeetyCount: {
    fontSize: FontSize.sm,
    color: Colors.gray500,
  },

  // Large Jeety badge
  jeetyBadgeLg: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.md,
  },
  jeetyBadgeLgText: {
    fontSize: FontSize.sm,
    color: Colors.green,
    fontWeight: FontWeight.bold,
  },

  // Invite button
  inviteBtn: {
    backgroundColor: Colors.pink,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.md,
  },
  inviteBtnText: {
    color: Colors.white,
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
  },

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
});
