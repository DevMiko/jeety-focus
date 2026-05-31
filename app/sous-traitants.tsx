import { Avatar } from '@/components/ui/avatar';
import { InfoBox } from '@/components/ui/info-box';
import type { ApiSousTraitant, SousTraitant } from '@/constants/mock-data';
import { SOUS_TRAITANTS } from '@/constants/mock-data';
import { Colors, FontSize, FontWeight, Radius, Shadows } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
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
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    auth.refreshTeam().catch(() => {});
  }, []);

  const apiList: ApiSousTraitant[] = auth.teamSousTraitants;
  const useMock = apiList.length === 0;

  const handleInvite = async (idSousTraitant: string, name: string) => {
    setLoadingId(idSousTraitant);
    const success = await auth.inviteMember('sous-traitant', idSousTraitant);
    setLoadingId(null);
    if (success) {
      Alert.alert('Invitation envoyée', `Un email d'invitation a été envoyé à ${name}.`);
      auth.refreshTeam().catch(() => {});
    } else {
      Alert.alert('Erreur', 'Impossible d\'envoyer l\'invitation. Vérifiez que ce sous-traitant a un email enregistré dans le CRM Jeety.');
    }
  };

  const getStatusBadge = (st: ApiSousTraitant) => {
    if (st.has_jeety) return null;
    if (st.status === 'en-attente') {
      return <View style={styles.badgePending}><Text style={styles.badgePendingText}>En attente</Text></View>;
    }
    if (st.status === 'inactif' && st.invitation_sent_at) {
      return <View style={styles.badgeRefused}><Text style={styles.badgeRefusedText}>Refusée</Text></View>;
    }
    return null;
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

        {/* ─── ST List (API) ─── */}
        {!useMock && apiList.map((st, index) => {
          const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];
          const id = String(st.id_sous_traitant);
          const hasBeenInvited = !!st.invitation_sent_at;
          const isPending = hasBeenInvited && st.status === 'en-attente';
          const isRefused = hasBeenInvited && st.status === 'inactif';
          const isLoading = loadingId === id;
          return (
            <View key={id} style={styles.stCard}>
              <Avatar
                initials={st.company_name.slice(0, 2).toUpperCase()}
                size={44}
                backgroundColor={avatarColor}
                borderRadius={Radius.md}
              />
              <View style={styles.stInfo}>
                <Text style={styles.stName}>{st.company_name}</Text>
                <Text style={styles.stSiret}>SIRET : {st.siret}</Text>
                {st.has_jeety ? (
                  <View style={styles.jeetyBadge}>
                    <Text style={styles.jeetyText}>✓ Jeety Focus</Text>
                    {st.rapport_count > 0 && (
                      <Text style={styles.jeetyCount}> • {st.rapport_count} rapports</Text>
                    )}
                  </View>
                ) : getStatusBadge(st)}
              </View>
              <View style={styles.actionCol}>
                {st.has_jeety ? (
                  <View style={styles.jeetyBadgeLg}>
                    <Text style={styles.jeetyBadgeLgText}>✓ Jeety</Text>
                  </View>
                ) : isPending ? (
                  <TouchableOpacity
                    style={[styles.relancerBtn, isLoading && { opacity: 0.6 }]}
                    onPress={() => handleInvite(id, st.company_name)}
                    disabled={isLoading}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.relancerBtnText}>{isLoading ? '...' : 'Relancer l\'invitation'}</Text>
                  </TouchableOpacity>
                ) : isRefused ? (
                  <TouchableOpacity
                    style={[styles.inviteBtn, isLoading && { opacity: 0.6 }]}
                    onPress={() => handleInvite(id, st.company_name)}
                    disabled={isLoading}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.inviteBtnText}>{isLoading ? '...' : 'Ré-inviter sur Jeety Focus'}</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.inviteBtn, isLoading && { opacity: 0.6 }]}
                    onPress={() => handleInvite(id, st.company_name)}
                    disabled={isLoading}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.inviteBtnText}>{isLoading ? '...' : 'Inviter sur Jeety Focus'}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}

        {/* ─── ST List (mock fallback) ─── */}
        {useMock && SOUS_TRAITANTS.map((st, index) => {
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
              </View>
              <TouchableOpacity style={styles.inviteBtn} activeOpacity={0.85}>
                <Text style={styles.inviteBtnText}>Inviter</Text>
              </TouchableOpacity>
            </View>
          );
        })}

        {apiList.length === 0 && SOUS_TRAITANTS.length === 0 && (
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

  // Action column
  actionCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
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

  // Relancer button
  relancerBtn: {
    backgroundColor: Colors.orange,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.md,
  },
  relancerBtnText: {
    color: Colors.white,
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
  },

  // Status badges inline
  badgePending: {
    marginTop: 3,
    backgroundColor: '#fef3c7',
    borderRadius: Radius.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  badgePendingText: {
    fontSize: FontSize.xs,
    color: '#b45309',
    fontWeight: FontWeight.semibold,
  },
  badgeRefused: {
    marginTop: 3,
    backgroundColor: '#fee2e2',
    borderRadius: Radius.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  badgeRefusedText: {
    fontSize: FontSize.xs,
    color: '#b91c1c',
    fontWeight: FontWeight.semibold,
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
