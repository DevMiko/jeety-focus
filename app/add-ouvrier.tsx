import { InfoBox } from '@/components/ui/info-box';
import { Colors, FontSize, FontWeight, Radius, Shadows } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
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

export default function AddOuvrierScreen() {
  const router = useRouter();
  const auth = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    const groups = digits.match(/.{1,2}/g) ?? [];
    return groups.join(' ');
  };

  const handleSubmit = async () => {
    if (!firstName.trim() || !lastName.trim() || phone.replace(/\s/g, '').length < 10) {
      Alert.alert('Champs requis', 'Veuillez remplir tous les champs correctement.');
      return;
    }
    setLoading(true);
    try {
      // TODO: appel API réel quand endpoint disponible
      await new Promise((resolve) => setTimeout(resolve, 1200));
      Alert.alert(
        'Invitation envoyée ✓',
        `Un SMS d'invitation a été envoyé à ${firstName} ${lastName} au ${phone}.`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      {/* ─── Header ─── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>‹ Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajouter un ouvrier</Text>
        <Text style={styles.headerSubtitle}>Créer un accès photo pour votre équipe</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentPadding}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ─── Info ─── */}
          <InfoBox
            variant="info"
            icon="💡"
            text="Comment ça marche ? — Un SMS d'invitation sera envoyé à l'ouvrier. Il pourra installer Jeety Focus et rejoindre votre équipe pour prendre des photos de chantier."
          />

          {/* ─── Form ─── */}
          <View style={styles.formCard}>
            {/* 1 — Identité */}
            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}>
                <Text style={styles.sectionNumberText}>1</Text>
              </View>
              <Text style={styles.sectionLabel}>Identité</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Prénom *</Text>
              <TextInput
                style={styles.formInput}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Prénom"
                placeholderTextColor={Colors.gray400}
                autoCapitalize="words"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nom *</Text>
              <TextInput
                style={styles.formInput}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Nom de famille"
                placeholderTextColor={Colors.gray400}
                autoCapitalize="characters"
              />
            </View>

            {/* 2 — Contact */}
            <View style={[styles.sectionHeader, { marginTop: 16 }]}>
              <View style={styles.sectionNumber}>
                <Text style={styles.sectionNumberText}>2</Text>
              </View>
              <Text style={styles.sectionLabel}>Contact</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Téléphone mobile *</Text>
              <TextInput
                style={styles.formInput}
                value={phone}
                onChangeText={(v) => setPhone(formatPhone(v))}
                placeholder="06 12 34 56 78"
                placeholderTextColor={Colors.gray400}
                keyboardType="phone-pad"
              />
              <Text style={styles.formHelp}>
                Un SMS d'invitation sera envoyé à ce numéro.
              </Text>
            </View>
          </View>

          {/* ─── Access info ─── */}
          <InfoBox
            variant="success"
            icon="📸"
            text={`${firstName || 'L\'ouvrier'} pourra prendre des photos libres et rattachées à vos dossiers CEE depuis Jeety Focus.`}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ─── Submit Button ─── */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnLoading]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.submitBtnText}>
            {loading ? 'Envoi en cours...' : '📨 Envoyer l\'invitation'}
          </Text>
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
  contentPadding: { padding: 14, paddingBottom: 40 },

  // Form card
  formCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: 16,
    marginTop: 14,
    marginBottom: 14,
    ...Shadows.sm,
  },

  // Section header (numbered)
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionNumberText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  sectionLabel: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: Colors.gray800,
  },

  // Form fields
  formGroup: { marginBottom: 12 },
  formLabel: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.gray600,
    marginBottom: 4,
  },
  formInput: {
    borderWidth: 2,
    borderColor: Colors.gray200,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: FontSize.xl,
    color: Colors.gray800,
    backgroundColor: Colors.gray50,
  },
  formHelp: {
    fontSize: FontSize.sm,
    color: Colors.gray400,
    marginTop: 4,
  },

  // Bottom bar
  bottomBar: {
    padding: 14,
    paddingBottom: 20,
    backgroundColor: Colors.gray50,
  },
  submitBtn: {
    backgroundColor: Colors.green,
    borderRadius: Radius.xl,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnLoading: { opacity: 0.7 },
  submitBtnText: {
    color: Colors.white,
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
  },
});
