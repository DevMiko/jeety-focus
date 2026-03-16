import { AddMembreCard, MembreCard } from '@/components/membre-card';
import { Avatar } from '@/components/ui/avatar';
import { InfoBox } from '@/components/ui/info-box';
import type { Lang } from '@/constants/i18n';
import { LANG_LABELS } from '@/constants/i18n';
import { OUVRIERS, SOUS_TRAITANTS } from '@/constants/mock-data';
import { Colors, FontSize, FontWeight, Radius, Shadows } from '@/constants/theme';
import { useRole } from '@/hooks/use-role';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({
  title,
  badge,
  badgeColor,
}: {
  title: string;
  badge?: number;
  badgeColor?: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {badge !== undefined && (
        <View style={[styles.sectionBadge, { backgroundColor: badgeColor ?? Colors.blue }]}>
          <Text style={styles.sectionBadgeText}>{badge}</Text>
        </View>
      )}
    </View>
  );
}

// ─── Settings Row ─────────────────────────────────────────────────────────────
function SettingsRow({
  icon,
  label,
  value,
  onPress,
  danger,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.settingsRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.settingsLeft}>
        <Text style={styles.settingsIcon}>{icon}</Text>
        <Text style={[styles.settingsLabel, danger && styles.settingsDanger]}>{label}</Text>
      </View>
      {value ? <Text style={styles.settingsValue}>{value}</Text> : null}
      <Text style={styles.settingsChevron}>›</Text>
    </TouchableOpacity>
  );
}

// ─── Language Picker ──────────────────────────────────────────────────────────
function LanguagePicker({
  current,
  onChange,
}: {
  current: Lang;
  onChange: (l: Lang) => void;
}) {
  const langs = Object.entries(LANG_LABELS) as [Lang, string][];
  return (
    <View style={styles.langPicker}>
      {langs.map(([key, label]) => (
        <TouchableOpacity
          key={key}
          style={[styles.langChip, current === key && styles.langChipActive]}
          onPress={() => onChange(key)}
          activeOpacity={0.8}
        >
          <Text style={[styles.langChipText, current === key && styles.langChipTextActive]}>
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ProfilScreen() {
  const router = useRouter();
  const { role, user, logout } = useRole();
  const [lang, setLang] = useState<Lang>('fr');

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

  // ─── ARTISAN ────────────────────────────────────────────────────────
  if (role === 'artisan') {
    return (
      <SafeAreaView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.profileHeader}>
            <Avatar initials={user?.initials ?? 'JD'} size={64} backgroundColor={Colors.pink} borderRadius={16} />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.firstName} {user?.lastName}</Text>
              <Text style={styles.profileRole}>Artisan RGE</Text>
              {user?.siret && <Text style={styles.profileSiret}>SIRET : {user.siret}</Text>}
              <Text style={styles.profileEmail}>{user?.email}</Text>
            </View>
          </View>

          {/* Mon équipe */}
          <View style={styles.section}>
            <SectionHeader title="Mon équipe" />

            {/* Ouvriers */}
            <SectionHeader title="Ouvriers" badge={OUVRIERS.length} badgeColor={Colors.pink} />
            {OUVRIERS.map((m) => (
              <MembreCard
                key={m.id}
                membre={m}
                onInvite={() => Alert.alert('Invitation envoyée', `SMS envoyé à ${m.phone}`)}
              />
            ))}
            <AddMembreCard
              label="Ajouter un ouvrier"
              onPress={() => router.push({ pathname: '/team', params: { section: 'add-ouvrier' } })}
            />

            {/* Sous-traitants */}
            <View style={{ marginTop: 16 }}>
              <SectionHeader title="Sous-traitants" badge={SOUS_TRAITANTS.length} badgeColor={Colors.green} />
              <InfoBox
                icon="ℹ️"
                text="Les sous-traitants sont liés automatiquement via leur SIRET enregistré dans votre CRM Jeety."
              />
              {SOUS_TRAITANTS.map((st) => (
                <View key={st.id} style={styles.stCard}>
                  <View style={styles.stLeft}>
                    <Avatar initials={st.name.slice(0, 2).toUpperCase()} size={40} backgroundColor={Colors.green} borderRadius={Radius.md} />
                    <View style={styles.stInfo}>
                      <Text style={styles.stName}>{st.name}</Text>
                      <Text style={styles.stSiret}>SIRET : {st.siret}</Text>
                      {st.hasJeety && (
                        <View style={styles.jeetyBadge}>
                          <Text style={styles.jeetyBadgeText}>✓ Jeety Focus</Text>
                          {st.rapportCount !== undefined && (
                            <Text style={styles.jeetyBadgeCount}> • {st.rapportCount} rapports</Text>
                          )}
                        </View>
                      )}
                    </View>
                  </View>
                  {!st.hasJeety && (
                    <TouchableOpacity
                      style={styles.inviteStBtn}
                      onPress={() => Alert.alert('Invitation', `Envoyer une invitation à ${st.name} ?`)}
                    >
                      <Text style={styles.inviteStText}>Inviter</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Paramètres */}
          <View style={styles.section}>
            <SectionHeader title="Paramètres" />
            <View style={styles.settingsCard}>
              <SettingsRow icon="📧" label="Email" value={user?.email} />
              <SettingsRow icon="🔔" label="Notifications" value="Activées" />
              <SettingsRow icon="📖" label="Guide d'utilisation" onPress={() => router.push('/guide')} />
              <SettingsRow icon="🔒" label="Changer le mot de passe" />
              <SettingsRow icon="🚪" label="Se déconnecter" onPress={handleLogout} danger />
            </View>
          </View>

          <Text style={styles.version}>Jeety Focus v1.0.0</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── SOUS-TRAITANT ───────────────────────────────────────────────────
  if (role === 'soustraitant') {
    return (
      <SafeAreaView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.profileHeader}>
            <Avatar initials={user?.initials ?? 'PM'} size={64} backgroundColor={Colors.pink} borderRadius={16} />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.firstName} {user?.lastName}</Text>
              <Text style={styles.profileRole}>{user?.company}</Text>
              {user?.siret && <Text style={styles.profileSiret}>SIRET : {user.siret}</Text>}
              <Text style={styles.profileEmail}>{user?.email}</Text>
            </View>
          </View>

          {/* Mon équipe */}
          <View style={styles.section}>
            <SectionHeader title="Mon équipe" />

            {/* Ouvriers */}
            <SectionHeader title="Ouvriers" badge={2} badgeColor={Colors.pink} />
            {[
              { id: '1', firstName: 'Marc', lastName: 'LEBLANC', initials: 'ML', phone: '06 12 34 56 78', status: 'active' as const, hasJeety: true },
              { id: '2', firstName: 'Thomas', lastName: 'DUBOIS', initials: 'TD', phone: '07 23 45 67 89', status: 'active' as const, hasJeety: true },
            ].map((m) => (
              <MembreCard key={m.id} membre={m} />
            ))}
            <AddMembreCard
              label="Ajouter un ouvrier"
              onPress={() => router.push({ pathname: '/team', params: { section: 'add-ouvrier' } })}
            />

            {/* Donneurs d'ordre */}
            <View style={{ marginTop: 16 }}>
              <SectionHeader title="Donneurs d'ordre" badge={1} badgeColor={Colors.blue} />
              <InfoBox
                icon="ℹ️"
                text="Les dossiers apparaissent automatiquement lorsqu'un artisan vous assigne via votre SIRET dans son CRM Jeety."
              />
              <View style={styles.stCard}>
                <View style={styles.stLeft}>
                  <Avatar initials="DE" size={40} backgroundColor={Colors.blue} borderRadius={Radius.md} />
                  <View style={styles.stInfo}>
                    <Text style={styles.stName}>Dupont Énergies</Text>
                    <Text style={styles.stSiret}>Artisan référent</Text>
                    <View style={styles.jeetyBadge}>
                      <Text style={styles.jeetyBadgeText}>✓ Actif</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Paramètres */}
          <View style={styles.section}>
            <SectionHeader title="Paramètres" />
            <View style={styles.settingsCard}>
              <SettingsRow icon="📧" label="Email" value={user?.email} />
              <SettingsRow icon="🔔" label="Notifications" value="Activées" />
              <SettingsRow icon="📖" label="Guide d'utilisation" onPress={() => router.push('/guide')} />
              <SettingsRow icon="🔒" label="Changer le mot de passe" />
              <SettingsRow icon="🚪" label="Se déconnecter" onPress={handleLogout} danger />
            </View>
          </View>

          <Text style={styles.version}>Jeety Focus v1.0.0</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── OUVRIER ─────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.profileHeader}>
          <Avatar initials={user?.initials ?? 'LM'} size={64} backgroundColor={Colors.pink} borderRadius={16} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.firstName} {user?.lastName}</Text>
            <Text style={styles.profileRole}>Ouvrier</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
        </View>

        {/* Mon employeur */}
        <View style={styles.section}>
          <SectionHeader title="Mon employeur" />
          <View style={styles.stCard}>
            <View style={styles.stLeft}>
              <Avatar initials="DE" size={40} backgroundColor={Colors.blue} borderRadius={Radius.md} />
              <View style={styles.stInfo}>
                <Text style={styles.stName}>{user?.employeur ?? 'Dupont Énergies'}</Text>
                <Text style={styles.stSiret}>Entreprise employeur</Text>
                <View style={styles.jeetyBadge}>
                  <Text style={styles.jeetyBadgeText}>✓ Actif</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Langue */}
        <View style={styles.section}>
          <SectionHeader title="Langue / Language" />
          <LanguagePicker current={lang} onChange={setLang} />
        </View>

        {/* Paramètres */}
        <View style={styles.section}>
          <SectionHeader title="Paramètres" />
          <View style={styles.settingsCard}>
            <SettingsRow icon="📧" label="Email" value={user?.email} />
            <SettingsRow icon="🔔" label="Notifications" value="Activées" />
            <SettingsRow icon="📖" label="Guide d'utilisation" onPress={() => router.push('/guide')} />
            <SettingsRow icon="🔒" label="Changer le mot de passe" />
            <SettingsRow icon="🚪" label="Se déconnecter" onPress={handleLogout} danger />
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
    padding: 14,
    paddingBottom: 100,
  },

  // Profile header
  profileHeader: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: Colors.blue,
    borderRadius: Radius.xl,
    padding: 16,
    marginBottom: 16,
    ...Shadows.md,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  profileName: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.extrabold,
    color: Colors.white,
  },
  profileRole: {
    fontSize: FontSize.base,
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
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.gray800,
  },
  sectionBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  sectionBadgeText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.extrabold,
  },

  // Sous-traitant card
  stCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.sm,
  },
  stLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  stInfo: {
    flex: 1,
    gap: 2,
  },
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
  jeetyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  jeetyBadgeText: {
    fontSize: FontSize.sm,
    color: Colors.green,
    fontWeight: FontWeight.semibold,
  },
  jeetyBadgeCount: {
    fontSize: FontSize.sm,
    color: Colors.gray500,
  },
  inviteStBtn: {
    backgroundColor: Colors.green,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.md,
  },
  inviteStText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },

  // Settings
  settingsCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    ...Shadows.sm,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  settingsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  settingsIcon: {
    fontSize: 16,
    width: 24,
    textAlign: 'center',
  },
  settingsLabel: {
    fontSize: FontSize.xl,
    color: Colors.gray800,
    fontWeight: FontWeight.medium,
  },
  settingsDanger: {
    color: Colors.error,
  },
  settingsValue: {
    fontSize: FontSize.base,
    color: Colors.gray500,
    marginRight: 4,
  },
  settingsChevron: {
    fontSize: 20,
    color: Colors.gray400,
    lineHeight: 22,
  },

  // Language picker
  langPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  langChip: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
    borderRadius: Radius.round,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  langChipActive: {
    backgroundColor: Colors.blue,
    borderColor: Colors.blue,
  },
  langChipText: {
    fontSize: FontSize.base,
    color: Colors.gray600,
    fontWeight: FontWeight.medium,
  },
  langChipTextActive: {
    color: Colors.white,
  },

  // Version
  version: {
    textAlign: 'center',
    fontSize: FontSize.sm,
    color: Colors.gray400,
    marginTop: 8,
    marginBottom: 16,
  },
});
