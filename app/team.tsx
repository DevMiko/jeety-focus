import { AddMembreCard, MembreCard } from '@/components/membre-card';
import { Avatar } from '@/components/ui/avatar';
import { InfoBox } from '@/components/ui/info-box';
import { OUVRIERS, OUVRIERS_ST, SOUS_TRAITANTS } from '@/constants/mock-data';
import { Colors, FontSize, FontWeight, Radius, Shadows } from '@/constants/theme';
import { useRole } from '@/hooks/use-role';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Add Ouvrier Form ─────────────────────────────────────────────────────────
function AddOuvrierForm({ onSuccess }: { onSuccess: () => void }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const formatPhone = (value: string) => {
    // Keep digits only, format as XX XX XX XX XX
    const digits = value.replace(/\D/g, '').slice(0, 10);
    const groups = digits.match(/.{1,2}/g) ?? [];
    return groups.join(' ');
  };

  const handleSubmit = () => {
    if (!firstName.trim() || !lastName.trim() || phone.replace(/\s/g, '').length < 10) {
      Alert.alert('Champs requis', 'Veuillez remplir tous les champs correctement.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Invitation envoyée ✓',
        `Un SMS d'invitation a été envoyé à ${firstName} ${lastName} au ${phone}.`,
        [{ text: 'OK', onPress: onSuccess }]
      );
    }, 1200);
  };

  return (
    <View style={styles.formCard}>
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
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Téléphone *</Text>
        <TextInput
          style={styles.formInput}
          value={phone}
          onChangeText={(v) => setPhone(formatPhone(v))}
          placeholder="06 12 34 56 78"
          placeholderTextColor={Colors.gray400}
          keyboardType="phone-pad"
        />
      </View>

      <InfoBox
        icon="📱"
        text={`Un SMS d'invitation sera envoyé à ${firstName || 'l\'ouvrier'}. Il pourra installer Jeety Focus et rejoindre votre équipe.`}
      />

      <TouchableOpacity
        style={[styles.submitBtn, loading && styles.submitBtnLoading]}
        onPress={handleSubmit}
        disabled={loading}
        activeOpacity={0.85}
      >
        <Text style={styles.submitBtnText}>
          {loading ? 'Envoi en cours...' : '📨 Envoyer l\'invitation SMS'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Donneurs d'ordre (ST + Ouvrier) ─────────────────────────────────────────
function DonneursOrdreSection() {
  return (
    <View>
      <InfoBox
        icon="ℹ️"
        text="Les dossiers apparaissent automatiquement lorsqu'un artisan vous assigne via votre SIRET enregistré dans son CRM Jeety. Vous ne pouvez pas gérer cette liste manuellement."
      />
      <View style={styles.donneurCard}>
        <Avatar initials="DE" size={44} backgroundColor={Colors.blue} borderRadius={Radius.md} />
        <View style={styles.donneurInfo}>
          <Text style={styles.donneurName}>Dupont Énergies</Text>
          <Text style={styles.donneurRole}>Artisan référent</Text>
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>✓ Actif — 2 chantiers en cours</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function TeamScreen() {
  const router = useRouter();
  const { role } = useRole();
  const params = useLocalSearchParams<{ section?: string }>();

  type TeamSection = 'ouvriers' | 'add-ouvrier' | 'soustraitants' | 'donneurs';
  const [activeSection, setActiveSection] = useState<TeamSection>(
    (params.section as TeamSection) ?? 'ouvriers'
  );

  const ouvriersList = role === 'soustraitant' ? OUVRIERS_ST : OUVRIERS;

  const getTitle = () => {
    switch (activeSection) {
      case 'ouvriers': return 'Mes ouvriers';
      case 'add-ouvrier': return 'Ajouter un ouvrier';
      case 'soustraitants': return 'Mes sous-traitants';
      case 'donneurs': return "Mes donneurs d'ordre";
      default: return 'Équipe';
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      {/* ─── Header ─── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getTitle()}</Text>
      </View>

      {/* ─── Tab selector (artisan only) ─── */}
      {role === 'artisan' && (
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeSection === 'ouvriers' && styles.tabActive]}
            onPress={() => setActiveSection('ouvriers')}
          >
            <Text style={[styles.tabText, activeSection === 'ouvriers' && styles.tabTextActive]}>
              Ouvriers
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeSection === 'soustraitants' && styles.tabActive]}
            onPress={() => setActiveSection('soustraitants')}
          >
            <Text style={[styles.tabText, activeSection === 'soustraitants' && styles.tabTextActive]}>
              Sous-traitants
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ─── Content ─── */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentPadding}
        showsVerticalScrollIndicator={false}
      >
        {/* OUVRIERS LIST */}
        {activeSection === 'ouvriers' && (
          <View>
            {ouvriersList.map((m) => (
              <MembreCard
                key={m.id}
                membre={m}
                onInvite={() =>
                  Alert.alert('Invitation', `Renvoyer une invitation SMS à ${m.firstName} ${m.lastName} ?`, [
                    { text: 'Annuler', style: 'cancel' },
                    { text: 'Envoyer', onPress: () => Alert.alert('Envoyé ✓', 'SMS envoyé.') },
                  ])
                }
                onRemove={() =>
                  Alert.alert('Retirer', `Retirer ${m.firstName} ${m.lastName} de votre équipe ?`, [
                    { text: 'Annuler', style: 'cancel' },
                    { text: 'Retirer', style: 'destructive' },
                  ])
                }
              />
            ))}
            <AddMembreCard
              label="Ajouter un ouvrier"
              onPress={() => setActiveSection('add-ouvrier')}
            />
          </View>
        )}

        {/* ADD OUVRIER */}
        {activeSection === 'add-ouvrier' && (
          <AddOuvrierForm onSuccess={() => setActiveSection('ouvriers')} />
        )}

        {/* SOUS-TRAITANTS (artisan only) */}
        {activeSection === 'soustraitants' && (
          <View>
            <InfoBox
              icon="ℹ️"
              text="Les sous-traitants sont liés automatiquement via leur SIRET enregistré dans votre CRM Jeety."
            />
            {SOUS_TRAITANTS.map((st) => (
              <View key={st.id} style={styles.stCard}>
                <Avatar initials={st.name.slice(0, 2).toUpperCase()} size={44} backgroundColor={Colors.green} borderRadius={Radius.md} />
                <View style={styles.stInfo}>
                  <Text style={styles.stName}>{st.name}</Text>
                  <Text style={styles.stSiret}>{st.siret}</Text>
                  {st.hasJeety && (
                    <Text style={styles.jeetyText}>
                      ✓ Jeety Focus {st.rapportCount !== undefined ? `• ${st.rapportCount} rapports` : ''}
                    </Text>
                  )}
                </View>
                {!st.hasJeety && (
                  <TouchableOpacity
                    style={styles.inviteBtn}
                    onPress={() => Alert.alert('Invitation', `Inviter ${st.name} sur Jeety Focus ?`)}
                  >
                    <Text style={styles.inviteBtnText}>Inviter</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        {/* DONNEURS D'ORDRE (ST + ouvrier) */}
        {activeSection === 'donneurs' && <DonneursOrdreSection />}

        {/* If ST/ouvrier, show donneurs button */}
        {activeSection === 'ouvriers' && (role === 'soustraitant' || role === 'ouvrier') && (
          <TouchableOpacity
            style={styles.sectionSwitch}
            onPress={() => setActiveSection('donneurs')}
          >
            <Text style={styles.sectionSwitchText}>→ Voir mes donneurs d'ordre</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.gray50 },
  header: {
    backgroundColor: Colors.blue,
    paddingHorizontal: 14,
    paddingBottom: 16,
  },
  backBtn: { paddingVertical: 10 },
  backText: { color: Colors.white, fontSize: FontSize.md, fontWeight: FontWeight.medium },
  headerTitle: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.extrabold,
    color: Colors.white,
  },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: Colors.blue },
  tabText: { fontSize: FontSize.xl, color: Colors.gray500, fontWeight: FontWeight.medium },
  tabTextActive: { color: Colors.blue, fontWeight: FontWeight.bold },

  content: { flex: 1 },
  contentPadding: { padding: 14, paddingBottom: 40 },

  // Add form
  formCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: 16,
    ...Shadows.sm,
    gap: 4,
  },
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
    fontFamily: 'System',
    color: Colors.gray800,
    backgroundColor: Colors.gray50,
  },
  submitBtn: {
    backgroundColor: Colors.blue,
    borderRadius: Radius.lg,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnLoading: { opacity: 0.7 },
  submitBtnText: {
    color: Colors.white,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },

  // ST card
  stCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    ...Shadows.sm,
  },
  stInfo: { flex: 1, gap: 2 },
  stName: { fontSize: FontSize.xl, fontWeight: FontWeight.semibold, color: Colors.gray800 },
  stSiret: { fontSize: FontSize.sm, color: Colors.gray500, fontFamily: 'monospace' },
  jeetyText: { fontSize: FontSize.sm, color: Colors.green, fontWeight: FontWeight.semibold },
  inviteBtn: {
    backgroundColor: Colors.green,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.md,
  },
  inviteBtnText: { color: Colors.white, fontSize: FontSize.sm, fontWeight: FontWeight.semibold },

  // Donneur card
  donneurCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: 12,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    ...Shadows.sm,
  },
  donneurInfo: { flex: 1, gap: 3 },
  donneurName: { fontSize: FontSize.xl, fontWeight: FontWeight.semibold, color: Colors.gray800 },
  donneurRole: { fontSize: FontSize.base, color: Colors.gray500 },
  activeBadge: {
    backgroundColor: '#dcfce7',
    borderRadius: Radius.xs,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  activeBadgeText: { fontSize: FontSize.sm, color: Colors.green, fontWeight: FontWeight.semibold },

  // Section switch
  sectionSwitch: {
    alignSelf: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.round,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
  },
  sectionSwitchText: { fontSize: FontSize.md, color: Colors.blue, fontWeight: FontWeight.semibold },
});
