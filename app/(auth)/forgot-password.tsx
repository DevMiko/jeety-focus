import { Colors, FontSize, FontWeight, Radius, Shadows } from '@/constants/theme';
import axios from 'axios';
import { useRouter } from 'expo-router';
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

const APP_BASE_URL = 'https://jeetydev.jddev.com/';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    if (!email.trim()) {
      setError('Veuillez saisir votre adresse email.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await axios.post(APP_BASE_URL + 'api/api.php', {
        action: 'forgot-password',
        email: email.trim(),
      }, { timeout: 15000 });
      if (res.data?.code === 'SUCCESS') {
        setSuccess(true);
      } else {
        setError(res.data?.message || 'Une erreur est survenue.');
      }
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.kav} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backText}>← Retour</Text>
          </TouchableOpacity>

          <View style={styles.logoWrapper}>
            <View style={styles.logoIconBox}>
              <Image source={require('@/assets/images/splash-icon.png')} style={styles.logoImage} />
            </View>
            <Text style={styles.logoText}>
              Jeety <Text style={styles.logoPink}>Focus</Text>
            </Text>
          </View>

          <View style={styles.card}>
            {!success ? (
              <>
                <Text style={styles.title}>Mot de passe oublié</Text>
                <Text style={styles.subtitle}>
                  Saisissez votre email pour recevoir un lien de réinitialisation
                </Text>

                {!!error && <Text style={styles.errorText}>{error}</Text>}

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Adresse e-mail</Text>
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="vous@exemple.fr"
                    placeholderTextColor={Colors.gray400}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.btn, isLoading && { opacity: 0.7 }]}
                  onPress={handleSubmit}
                  disabled={isLoading}
                  activeOpacity={0.85}
                >
                  {isLoading
                    ? <ActivityIndicator color={Colors.white} size="small" />
                    : <Text style={styles.btnText}>Envoyer le lien de réinitialisation</Text>
                  }
                </TouchableOpacity>

                <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
                  <Text style={styles.backLinkText}>← Retour à la connexion</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.successIcon}>✉️</Text>
                <Text style={styles.title}>Email envoyé</Text>
                <Text style={styles.subtitle}>
                  Si votre adresse email est associée à un compte, vous recevrez un lien de réinitialisation dans quelques instants. Pensez à vérifier vos spams.
                </Text>
                <TouchableOpacity style={styles.btn} onPress={() => router.back()} activeOpacity={0.85}>
                  <Text style={styles.btnText}>Retour à la connexion</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

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
  backBtn: { paddingVertical: 6, marginBottom: 8, alignSelf: 'flex-start' },
  backText: { color: 'rgba(255,255,255,0.85)', fontSize: FontSize.md, fontWeight: FontWeight.medium },
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
  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 24,
    ...Shadows.lg,
  },
  title: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: Colors.gray800,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.gray500,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  errorText: {
    color: Colors.error,
    fontSize: FontSize.base,
    textAlign: 'center',
    marginBottom: 12,
  },
  formGroup: { marginBottom: 16 },
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
  btn: {
    backgroundColor: Colors.blue,
    borderRadius: Radius.lg,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  btnText: { color: Colors.white, fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  backLink: { alignItems: 'center', marginTop: 16 },
  backLinkText: { color: Colors.blue, fontSize: FontSize.base },
  successIcon: { fontSize: 40, textAlign: 'center', marginBottom: 12 },
});
