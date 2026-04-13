import { Avatar } from '@/components/ui/avatar';
import { OUVRIERS, SOUS_TRAITANTS } from '@/constants/mock-data';
import { Colors, FontSize, FontWeight, Radius, Shadows } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/hooks/use-role';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Section Title ────────────────────────────────────────────────────────────
function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

// ─── Navigation Row ───────────────────────────────────────────────────────────
function NavRow({
  icon,
  label,
  badge,
  badgeColor,
  onPress,
  danger,
}: {
  icon: string;
  label: string;
  badge?: number;
  badgeColor?: string;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.navRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.navLeft}>
        <Text style={styles.navIcon}>{icon}</Text>
        <Text style={[styles.navLabel, danger && styles.navDanger]}>{label}</Text>
      </View>
      <View style={styles.navRight}>
        {badge !== undefined && (
          <View style={[styles.navBadge, { backgroundColor: badgeColor ?? Colors.blue }]}>
            <Text style={styles.navBadgeText}>{badge}</Text>
          </View>
        )}
        <Text style={styles.navChevron}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ProfilScreen() {
  const router = useRouter();
  const { role, user, logout } = useRole();
  const auth = useAuth();

  // Counts for badges
  const ouvriersCount = auth.teamOuvriers.length > 0
    ? auth.teamOuvriers.length
    : OUVRIERS.length;

  const stCount = auth.teamSousTraitants.length > 0
    ? auth.teamSousTraitants.length
    : SOUS_TRAITANTS.length;

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Se déconnecter',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/(auth)/welcome');
        },
      },
    ]);
  };

  const getRoleLabel = () => {
    switch (role) {
      case 'artisan': return 'Artisan RGE';
      case 'soustraitant': return user?.company ?? 'Sous-traitant';
      case 'ouvrier': return 'Ouvrier';
      default: return '';
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ─── Profile Header ─── */}
        <View style={styles.profileHeader}>
          <Avatar
            initials={user?.initials ?? 'JD'}
            size={72}
            backgroundColor={Colors.pink}
            borderRadius={18}
          />
          <Text style={styles.profileName}>{user?.firstName} {user?.lastName}</Text>
          <Text style={styles.profileRole}>{getRoleLabel()}</Text>
          {user?.siret && <Text style={styles.profileSiret}>SIRET : {user.siret}</Text>}
          <Text style={styles.profileEmail}>{user?.email}</Text>
        </View>

        {/* ─── Mon équipe (artisan + ST) ─── */}
        {(role === 'artisan' || role === 'soustraitant') && (
          <View style={styles.section}>
            <SectionTitle title="MON ÉQUIPE" />
            <View style={styles.card}>
              <NavRow
                icon="👷"
                label="Gérer mes ouvriers"
                badge={ouvriersCount}
                badgeColor={Colors.pink}
                onPress={() => router.push('/ouvriers')}
              />
            </View>
          </View>
        )}

        {/* ─── Mes sous-traitants (artisan only) ─── */}
        {role === 'artisan' && (
          <View style={styles.section}>
            <SectionTitle title="MES SOUS-TRAITANTS" />
            <View style={styles.card}>
              <NavRow
                icon="🏢"
                label="Gérer mes sous-traitants"
                badge={stCount}
                badgeColor={Colors.green}
                onPress={() => router.push('/sous-traitants')}
              />
            </View>
          </View>
        )}

        {/* ─── Mon employeur (ouvrier only) ─── */}
        {role === 'ouvrier' && (
          <View style={styles.section}>
            <SectionTitle title="MON EMPLOYEUR" />
            <View style={[styles.card, { padding: 14, flexDirection: 'row', gap: 10, alignItems: 'center' }]}>
              <Avatar
                initials="DE"
                size={40}
                backgroundColor={Colors.blue}
                borderRadius={Radius.md}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.employeurName}>{user?.employeur ?? 'Dupont Énergies'}</Text>
                <Text style={styles.employeurSub}>Entreprise employeur</Text>
              </View>
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>✓ Actif</Text>
              </View>
            </View>
          </View>
        )}

        {/* ─── Paramètres ─── */}
        <View style={styles.section}>
          <SectionTitle title="PARAMÈTRES" />
          <View style={styles.card}>
            <NavRow icon="🔔" label="Notifications" onPress={() => {}} />
            <NavRow icon="📖" label="Aide & guide" onPress={() => router.push('/guide')} />
            <NavRow icon="🚪" label="Se déconnecter" onPress={handleLogout} danger />
          </View>
        </View>

        <Text style={styles.version}>Jeety Focus v1.0.0</Text>
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
  scrollContent: {
    paddingBottom: 100,
  },

  // Profile header
  profileHeader: {
    backgroundColor: Colors.blue,
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 24,
    paddingHorizontal: 14,
    gap: 3,
  },
  profileName: {
    fontSize: FontSize['3xl'],
    fontWeight: FontWeight.extrabold,
    color: Colors.white,
    marginTop: 10,
  },
  profileRole: {
    fontSize: FontSize.xl,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: FontWeight.medium,
  },
  profileSiret: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.6)',
    fontFamily: 'monospace',
  },
  profileEmail: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.6)',
  },

  // Sections
  section: {
    marginTop: 20,
    paddingHorizontal: 14,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.gray500,
    letterSpacing: 1,
    marginBottom: 8,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    ...Shadows.sm,
    overflow: 'hidden',
  },

  // Nav row
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  navIcon: {
    fontSize: 16,
    width: 24,
    textAlign: 'center',
  },
  navLabel: {
    fontSize: FontSize.xl,
    color: Colors.gray800,
    fontWeight: FontWeight.medium,
  },
  navDanger: {
    color: Colors.error,
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  navBadgeText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.extrabold,
  },
  navChevron: {
    fontSize: 22,
    color: Colors.gray400,
    lineHeight: 24,
  },

  // Employeur (ouvrier)
  employeurName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.gray800,
  },
  employeurSub: {
    fontSize: FontSize.sm,
    color: Colors.gray500,
  },
  activeBadge: {
    backgroundColor: '#dcfce7',
    borderRadius: Radius.xs,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  activeBadgeText: {
    fontSize: FontSize.sm,
    color: Colors.green,
    fontWeight: FontWeight.semibold,
  },

  // Version
  version: {
    textAlign: 'center',
    fontSize: FontSize.sm,
    color: Colors.gray400,
    marginTop: 24,
    marginBottom: 16,
  },
});