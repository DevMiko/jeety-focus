import type { Role } from '@/constants/mock-data';
import { Colors, FontSize, FontWeight, Radius, Shadows } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/hooks/use-role';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Simple Login Form (all roles) ───────────────────────────────────────────
function LoginForm({ onSubmit, error, isLoading }: { onSubmit: (email: string, password: string) => void; error?: string | null; isLoading?: boolean }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return (
    <View style={styles.form}>
      <Text style={styles.formTitle}>Connexion</Text>
      {!!error && <Text style={[styles.statusText, styles.statusError, { textAlign: 'center', marginBottom: 8 }]}>{error}</Text>}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="vous@exemple.fr"
          placeholderTextColor={Colors.gray400}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Mot de passe</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor={Colors.gray400}
          secureTextEntry
        />
      </View>
      <TouchableOpacity style={[styles.btnPrimary, isLoading && { opacity: 0.7 }]} onPress={() => onSubmit(email, password)} disabled={isLoading} activeOpacity={0.85}>
        {isLoading ? <ActivityIndicator color={Colors.white} size="small" /> : <Text style={styles.btnPrimaryText}>Se connecter</Text>}
      </TouchableOpacity>
      <TouchableOpacity style={styles.forgotLink}>
        <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── SIRET Signup (Sous-traitant) ─────────────────────────────────────────────
function SiretSignupForm({ onSubmit }: { onSubmit: () => void }) {
  const [step, setStep] = useState<'siret' | 'result' | 'account'>('siret');
  const [siret, setSiret] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSearch = () => {
    if (siret.length < 9) {
      setStatus('SIRET invalide (14 chiffres requis)');
      return;
    }
    setLoading(true);
    setStatus('Recherche en cours...');
    setTimeout(() => {
      setLoading(false);
      setStatus('');
      setStep('result');
    }, 1200);
  };

  if (step === 'siret') {
    return (
      <View style={styles.form}>
        <Text style={styles.formTitle}>Créer mon compte</Text>
        <Text style={styles.formHelp}>
          Entrez votre SIRET pour identifier votre entreprise
        </Text>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Numéro SIRET</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={siret}
              onChangeText={setSiret}
              placeholder="123 456 789 00012"
              placeholderTextColor={Colors.gray400}
              keyboardType="numeric"
              maxLength={17}
            />
            <TouchableOpacity
              style={styles.searchBtn}
              onPress={handleSearch}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <Text style={styles.searchBtnText}>🔍</Text>
              )}
            </TouchableOpacity>
          </View>
          {!!status && (
            <Text style={[styles.statusText, loading ? styles.statusLoading : styles.statusError]}>
              {status}
            </Text>
          )}
        </View>
      </View>
    );
  }

  if (step === 'result') {
    return (
      <View style={styles.form}>
        <Text style={styles.formTitle}>Entreprise trouvée</Text>
        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>✓ ENTREPRISE IDENTIFIÉE</Text>
          <Text style={styles.resultName}>Isol Therm SARL</Text>
          <Text style={styles.resultAddress}>12 rue des Artisans, 75010 Paris</Text>
          <Text style={styles.resultSiret}>SIRET : {siret || '456 789 123 00056'}</Text>
        </View>
        <View style={styles.btnGroup}>
          <TouchableOpacity style={styles.btnOutline} onPress={() => setStep('siret')} activeOpacity={0.8}>
            <Text style={styles.btnOutlineText}>Ce n'est pas moi</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => setStep('account')} activeOpacity={0.85}>
            <Text style={styles.btnPrimaryText}>C'est mon entreprise →</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.form}>
      <Text style={styles.formTitle}>Créer mon accès</Text>
      <View style={styles.confirmedCard}>
        <Text style={styles.confirmedName}>Isol Therm SARL</Text>
        <Text style={styles.confirmedSub}>SIRET : {siret || '456 789 123 00056'}</Text>
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Email professionnel</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="vous@entreprise.fr"
          placeholderTextColor={Colors.gray400}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Mot de passe</Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="••••••••" placeholderTextColor={Colors.gray400} secureTextEntry />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Confirmer le mot de passe</Text>
        <TextInput style={styles.input} value={confirmPassword} onChangeText={setConfirmPassword} placeholder="••••••••" placeholderTextColor={Colors.gray400} secureTextEntry />
      </View>
      <TouchableOpacity style={styles.btnPrimary} onPress={onSubmit} activeOpacity={0.85}>
        <Text style={styles.btnPrimaryText}>Créer mon compte</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Phone Signup (Ouvrier) ───────────────────────────────────────────────────
function PhoneSignupForm({ onSubmit }: { onSubmit: () => void }) {
  const [step, setStep] = useState<'phone' | 'result' | 'account'>('phone');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSearch = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('result');
    }, 1200);
  };

  if (step === 'phone') {
    return (
      <View style={styles.form}>
        <Text style={styles.formTitle}>Créer mon compte</Text>
        <Text style={styles.formHelp}>
          Votre employeur vous a envoyé une invitation. Entrez votre numéro de téléphone pour la retrouver.
        </Text>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Numéro de téléphone</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={phone}
              onChangeText={setPhone}
              placeholder="06 12 34 56 78"
              placeholderTextColor={Colors.gray400}
              keyboardType="phone-pad"
              maxLength={14}
            />
            <TouchableOpacity
              style={styles.searchBtn}
              onPress={handleSearch}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <Text style={styles.searchBtnText}>🔍</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (step === 'result') {
    return (
      <View style={styles.form}>
        <Text style={styles.formTitle}>Invitation trouvée !</Text>
        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>✓ INVITATION TROUVÉE</Text>
          <Text style={styles.resultName}>Lucas MARTIN</Text>
          <Text style={styles.resultAddress}>
            Ouvrier chez <Text style={{ color: Colors.blue, fontWeight: FontWeight.bold }}>Dupont Énergies</Text>
          </Text>
        </View>
        <View style={styles.btnGroup}>
          <TouchableOpacity style={styles.btnOutline} onPress={() => setStep('phone')} activeOpacity={0.8}>
            <Text style={styles.btnOutlineText}>Ce n'est pas moi</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => setStep('account')} activeOpacity={0.85}>
            <Text style={styles.btnPrimaryText}>C'est moi ! →</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.form}>
      <Text style={styles.formTitle}>Créer mon accès</Text>
      <View style={styles.confirmedCard}>
        <Text style={styles.confirmedName}>Lucas MARTIN ✓</Text>
        <Text style={styles.confirmedSub}>Ouvrier chez Dupont Énergies</Text>
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="vous@email.fr" placeholderTextColor={Colors.gray400} keyboardType="email-address" autoCapitalize="none" />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Mot de passe</Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="••••••••" placeholderTextColor={Colors.gray400} secureTextEntry />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Confirmer</Text>
        <TextInput style={styles.input} value={confirmPassword} onChangeText={setConfirmPassword} placeholder="••••••••" placeholderTextColor={Colors.gray400} secureTextEntry />
      </View>
      <TouchableOpacity style={styles.btnPrimary} onPress={onSubmit} activeOpacity={0.85}>
        <Text style={styles.btnPrimaryText}>Créer mon compte</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Main Login Screen ────────────────────────────────────────────────────────

const ROLE_LABELS: Record<Role, string> = {
  artisan: 'Artisan',
  soustraitant: 'Sous-traitant',
  ouvrier: 'Ouvrier',
};

export default function LoginScreen() {
  const router = useRouter();
  const auth = useAuth();
  const { role: roleParam } = useLocalSearchParams<{ role: Role }>();
  const { setRole } = useRole();
  const role: Role = roleParam ?? 'artisan';
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  const hasRegisterFlow = role !== 'artisan';

  const handleLogin = async (email: string, password: string) => {
    const success = await auth.login(email, password);
    if (!success) return;
    setRole(role);
    router.replace('/(tabs)');
  };

  const handleRegister = () => {
    setRole(role);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Status bar */}
          <Text style={styles.time}>9:41</Text>

          {/* Back button */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backText}>← Retour</Text>
          </TouchableOpacity>

          {/* Logo */}
          <View style={styles.logoWrapper}>
            <View style={styles.logoIconBox}>
              <Image source={require('@/assets/images/splash-icon.png')} style={styles.logoImage} />
            </View>
            <Text style={styles.logoText}>
              Jeety <Text style={styles.logoPink}>Focus</Text>
            </Text>
            <Text style={styles.logoSub}>Profil : {ROLE_LABELS[role]}</Text>
          </View>

          {/* Tab switcher (only for ST / Ouvrier) */}
          {hasRegisterFlow && (
            <View style={styles.tabs}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'login' && styles.tabActive]}
                onPress={() => setActiveTab('login')}
              >
                <Text style={[styles.tabText, activeTab === 'login' && styles.tabTextActive]}>
                  Connexion
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'register' && styles.tabActive]}
                onPress={() => setActiveTab('register')}
              >
                <Text style={[styles.tabText, activeTab === 'register' && styles.tabTextActive]}>
                  Pas encore de compte ?
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Form card */}
          <View style={styles.formCard}>
            {activeTab === 'login' || !hasRegisterFlow ? (
              <LoginForm onSubmit={handleLogin} error={auth.loginError} isLoading={auth.isLoading} />
            ) : role === 'soustraitant' ? (
              <SiretSignupForm onSubmit={handleRegister} />
            ) : (
              <PhoneSignupForm onSubmit={handleRegister} />
            )}
          </View>

          {/* Footer */}
          <Text style={styles.footer}>
            Jeety Focus © 2025 • <Text style={styles.footerLink}>jeety.fr</Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.blue },
  kav: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40, flexGrow: 1 },
  time: {
    color: Colors.white,
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.xl,
    marginBottom: 4,
  },
  backBtn: { paddingVertical: 6, marginBottom: 8, alignSelf: 'flex-start' },
  backText: { color: 'rgba(255,255,255,0.85)', fontSize: FontSize.md, fontWeight: FontWeight.medium },
  // Logo
  logoWrapper: { alignItems: 'center', marginTop: 8, marginBottom: 24 },
  logoIconBox: {
    width: 56,
    height: 56,
    backgroundColor: Colors.white,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    ...Shadows.lg,
  },
  logoImage: { width: 40, height: 40, borderRadius: 8 },
  logoText: { color: Colors.white, fontSize: FontSize['4xl'], fontWeight: FontWeight.extrabold },
  logoPink: { color: Colors.pink },
  logoSub: { color: 'rgba(255,255,255,0.7)', fontSize: FontSize.md, marginTop: 4 },
  // Tabs
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.lg,
    padding: 3,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: Colors.white },
  tabText: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: 'rgba(255,255,255,0.7)' },
  tabTextActive: { color: Colors.blue },
  // Card
  formCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  // Form
  form: { padding: 24 },
  formTitle: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: Colors.gray800,
    textAlign: 'center',
    marginBottom: 16,
  },
  formHelp: {
    fontSize: FontSize.md,
    color: Colors.gray500,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  formGroup: { marginBottom: 12 },
  label: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.gray600,
    marginBottom: 4,
  },
  input: {
    borderWidth: 2,
    borderColor: Colors.gray200,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: FontSize.xl,
    color: Colors.gray800,
    backgroundColor: Colors.gray50,
  },
  inputRow: { flexDirection: 'row', gap: 8 },
  searchBtn: {
    width: 44,
    backgroundColor: Colors.blue,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBtnText: { fontSize: 18 },
  statusText: { fontSize: FontSize.base, marginTop: 6 },
  statusLoading: { color: Colors.orange },
  statusError: { color: Colors.error },
  // Buttons
  btnPrimary: {
    backgroundColor: Colors.blue,
    borderRadius: Radius.lg,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  btnPrimaryText: { color: Colors.white, fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  btnOutline: {
    flex: 1,
    borderWidth: 2,
    borderColor: Colors.gray200,
    borderRadius: Radius.lg,
    paddingVertical: 10,
    alignItems: 'center',
  },
  btnOutlineText: { color: Colors.gray700, fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  btnGroup: { flexDirection: 'row', gap: 8, marginTop: 8 },
  forgotLink: { alignItems: 'center', marginTop: 12 },
  forgotText: { color: Colors.blue, fontSize: FontSize.base },
  // Result card
  resultCard: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: Radius.lg,
    padding: 12,
    marginBottom: 16,
  },
  resultLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.extrabold,
    color: Colors.green,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  resultName: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.gray800, marginBottom: 2 },
  resultAddress: { fontSize: FontSize.base, color: Colors.gray600, marginBottom: 4 },
  resultSiret: { fontSize: FontSize.sm, color: Colors.gray500, fontFamily: 'monospace' },
  // Confirmed card
  confirmedCard: {
    backgroundColor: Colors.gray50,
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: Radius.lg,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  confirmedName: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.gray800 },
  confirmedSub: { fontSize: FontSize.base, color: Colors.gray500, marginTop: 2 },
  // Footer
  footer: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.5)',
    fontSize: FontSize.sm,
    marginTop: 24,
  },
  footerLink: { color: Colors.white },
});
