import type { Role } from '@/constants/mock-data';
import { Colors, FontSize, FontWeight, Radius, Shadows } from '@/constants/theme';
import { useRole } from '@/hooks/use-role';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface RoleCard {
  id: Role | 'beneficiaire';
  label: string;
  icon: string;
  subtitle: string;
  available: boolean;
}

const PRIMARY_ROLES: RoleCard[] = [
  {
    id: 'artisan',
    label: 'Artisan',
    icon: '🔧',
    subtitle: 'Poseur RGE',
    available: true,
  },
  {
    id: 'beneficiaire',
    label: 'Bénéficiaire',
    icon: '🏠',
    subtitle: 'Bientôt disponible',
    available: false,
  },
];

const OTHER_ROLES: RoleCard[] = [
  {
    id: 'soustraitant',
    label: 'Sous-traitant',
    icon: '🏗️',
    subtitle: 'Entreprise ST',
    available: true,
  },
  {
    id: 'ouvrier',
    label: 'Ouvrier',
    icon: '⛑️',
    subtitle: 'Salarié / Équipe',
    available: true,
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const { setRole } = useRole();
  const [selectedRole, setSelectedRole] = useState<Role>('artisan');
  const [showOtherRoles, setShowOtherRoles] = useState(false);

  const handleContinue = () => {
    setRole(selectedRole);
    router.push({ pathname: '/(auth)/login', params: { role: selectedRole } });
  };

  const handleSelectRole = (id: Role | 'beneficiaire') => {
    if (id === 'beneficiaire') return;
    setSelectedRole(id as Role);
  };

  const renderCard = (card: RoleCard) => {
    const isSelected = selectedRole === card.id;
    return (
      <TouchableOpacity
        key={card.id}
        style={[
          styles.card,
          isSelected && styles.cardSelected,
          !card.available && styles.cardDisabled,
        ]}
        onPress={() => handleSelectRole(card.id)}
        activeOpacity={card.available ? 0.8 : 1}
        disabled={!card.available}
      >
        <Text style={styles.cardIcon}>{card.icon}</Text>
        <Text style={[styles.cardLabel, !card.available && styles.cardLabelDisabled]}>
          {card.label}
        </Text>
        <Text style={[styles.cardSubtitle, !card.available && styles.cardSubtitleDisabled]}>
          {card.subtitle}
        </Text>
        {!card.available && (
          <View style={styles.soonBadge}>
            <Text style={styles.soonText}>Bientôt</Text>
          </View>
        )}
        {isSelected && (
          <View style={styles.checkBadge}>
            <Text style={styles.checkText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Status bar area */}
        <Text style={styles.time}>9:41</Text>

        {/* Logo */}
        <View style={styles.logoWrapper}>
          <View style={styles.logoIconBox}>
            <Text style={styles.logoIconEmoji}>📷</Text>
          </View>
          <Text style={styles.logoText}>
            Jeety <Text style={styles.logoPink}>Focus</Text>
          </Text>
          <Text style={styles.logoSub}>Rapports photo chantier</Text>
        </View>

        {/* Card */}
        <View style={styles.card2}>
          <Text style={styles.card2Title}>Qui êtes-vous ?</Text>
          <Text style={styles.card2Sub}>
            Sélectionnez votre profil pour accéder à l'application
          </Text>

          {/* Primary roles */}
          <View style={styles.grid}>{PRIMARY_ROLES.map(renderCard)}</View>

          {/* Other roles toggle */}
          <TouchableOpacity
            style={styles.otherRolesBtn}
            onPress={() => setShowOtherRoles((v) => !v)}
            activeOpacity={0.8}
          >
            <Text style={styles.otherRolesBtnText}>
              {showOtherRoles ? '▲ Masquer' : '▼ Autres rôles'}
            </Text>
          </TouchableOpacity>

          {showOtherRoles && (
            <View style={[styles.grid, styles.gridOther]}>{OTHER_ROLES.map(renderCard)}</View>
          )}

          {/* Continue button */}
          <TouchableOpacity style={styles.continueBtn} onPress={handleContinue} activeOpacity={0.85}>
            <Text style={styles.continueBtnText}>Continuer →</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          v1.0.0 • Jeety Focus © 2025{'\n'}
          <Text style={styles.footerLink}>jeety.fr</Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.blue,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    flexGrow: 1,
  },
  time: {
    color: Colors.white,
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.xl,
    textAlign: 'left',
    marginBottom: 8,
  },
  // Logo
  logoWrapper: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  logoIconBox: {
    width: 64,
    height: 64,
    backgroundColor: Colors.white,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    ...Shadows.lg,
  },
  logoIconEmoji: {
    fontSize: 28,
  },
  logoText: {
    color: Colors.white,
    fontSize: FontSize['5xl'],
    fontWeight: FontWeight.extrabold,
  },
  logoPink: {
    color: Colors.pink,
  },
  logoSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: FontSize.md,
    marginTop: 4,
  },
  // White card
  card2: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 24,
    ...Shadows.lg,
  },
  card2Title: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: Colors.gray800,
    textAlign: 'center',
    marginBottom: 4,
  },
  card2Sub: {
    fontSize: FontSize.md,
    color: Colors.gray500,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  grid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  gridOther: {
    marginTop: 8,
    marginBottom: 8,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.gray50,
    borderRadius: Radius.xl,
    borderWidth: 2,
    borderColor: Colors.gray200,
    padding: 14,
    alignItems: 'center',
    gap: 4,
    position: 'relative',
  },
  cardSelected: {
    backgroundColor: '#e8f4fc',
    borderColor: Colors.blue,
  },
  cardDisabled: {
    opacity: 0.55,
  },
  cardIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  cardLabel: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.gray800,
  },
  cardLabelDisabled: {
    color: Colors.gray400,
  },
  cardSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.gray500,
    textAlign: 'center',
  },
  cardSubtitleDisabled: {
    color: Colors.gray300,
  },
  soonBadge: {
    marginTop: 4,
    backgroundColor: Colors.gray200,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.round,
  },
  soonText: {
    fontSize: FontSize.xs,
    color: Colors.gray500,
    fontWeight: FontWeight.semibold,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: FontWeight.bold,
  },
  // Autres rôles
  otherRolesBtn: {
    alignItems: 'center',
    paddingVertical: 8,
    marginVertical: 4,
  },
  otherRolesBtnText: {
    fontSize: FontSize.md,
    color: Colors.blue,
    fontWeight: FontWeight.semibold,
  },
  // Continue
  continueBtn: {
    marginTop: 16,
    backgroundColor: Colors.blue,
    borderRadius: Radius.lg,
    paddingVertical: 14,
    alignItems: 'center',
  },
  continueBtnText: {
    color: Colors.white,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  // Footer
  footer: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.5)',
    fontSize: FontSize.sm,
    marginTop: 24,
    lineHeight: 16,
  },
  footerLink: {
    color: Colors.white,
  },
});
