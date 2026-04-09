import type { DossierType } from '@/constants/mock-data';
import { Colors, FontSize, FontWeight, Radius, Shadows } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/hooks/use-role';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
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

// ─── Fallback data (utilisé si l’API ne répond pas) ───────────────────────
const FALLBACK_ADDRESSES = [
  '12 rue des Lilas, 75011 Paris',
  '8 av. Victor Hugo, 69006 Lyon',
  '25 chemin des Vignes, 33000 Bordeaux',
  '18 bd Haussmann, 75009 Paris',
  '5 place Bellecour, 69002 Lyon',
  '7 rue Gambetta, 31000 Toulouse',
  '2 rue de la Liberté, 13000 Marseille',
];

const FALLBACK_COMPANIES = ['Dupont Énergies', 'Isol Therm SARL', 'Clim Plus SARL'];

// ─── Step Number Badge ─────────────────────────────────────────────────────
function StepNum({ n }: { n: number }) {
  return (
    <View style={styles.stepNum}>
      <Text style={styles.stepNumText}>{n}</Text>
    </View>
  );
}

// ─── Section container ─────────────────────────────────────────────────────
function Section({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[styles.section, style]}>{children}</View>;
}

// ─── Type chip ─────────────────────────────────────────────────────────────
function TypeChip({
  type,
  selected,
  onToggle,
}: {
  type: DossierType;
  selected: boolean;
  onToggle: () => void;
}) {
  const labels: Record<DossierType, string> = {
    PAC: '🌡️ PAC',
    BALLON: '💧 Ballon',
    ISOLATION: '🏠 Isolation',
    CHAUDIERE: '🔥 Chaudière',
  };
  return (
    <TouchableOpacity
      style={[styles.typeChip, selected && styles.typeChipSelected]}
      onPress={onToggle}
      activeOpacity={0.8}
    >
      <Text style={[styles.typeChipText, selected && styles.typeChipTextSelected]}>
        {labels[type]}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Phase option ──────────────────────────────────────────────────────────
function PhaseOption({
  label,
  icon,
  selected,
  onSelect,
}: {
  label: string;
  icon: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.phaseOption, selected && styles.phaseOptionSelected]}
      onPress={onSelect}
      activeOpacity={0.85}
    >
      <Text style={styles.phaseIcon}>{icon}</Text>
      <Text style={[styles.phaseLabel, selected && styles.phaseLabelSelected]}>{label}</Text>
      {selected && <View style={styles.phaseCheck}><Text style={styles.phaseCheckText}>✓</Text></View>}
    </TouchableOpacity>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────
export default function CreateScreen() {
  const router = useRouter();
  const { role } = useRole();
  const auth = useAuth();

  // Section 1 state
  const [address, setAddress] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [companyOrdre, setCompanyOrdre] = useState('');
  const [showCompanyPicker, setShowCompanyPicker] = useState(false);

  // Dynamic data with fallback
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [searchingAddresses, setSearchingAddresses] = useState(false);
  const [companyOptions, setCompanyOptions] = useState<string[]>(FALLBACK_COMPANIES);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load companies (donneurs d'ordre) from API on mount
  useEffect(() => {
    (async () => {
      try {
        const companies = await auth.getCompanies();
        if (companies.length > 0) {
          setCompanyOptions(companies.map((d) => d.name));
        }
      } catch {
        // Fallback already set
      }
    })();
  }, []);

  // Debounced address search
  const handleAddressChange = useCallback((value: string) => {
    setAddress(value);
    if (value.length < 2) {
      setShowSuggestions(false);
      setAddressSuggestions([]);
      return;
    }
    setShowSuggestions(true);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      setSearchingAddresses(true);
      try {
        const results = await auth.searchAddresses(value);
        if (results.length > 0) {
          setAddressSuggestions(results);
        } else {
          // Fallback: filter local mock addresses
          setAddressSuggestions(
            FALLBACK_ADDRESSES.filter((a) => a.toLowerCase().includes(value.toLowerCase()))
          );
        }
      } catch {
        setAddressSuggestions(
          FALLBACK_ADDRESSES.filter((a) => a.toLowerCase().includes(value.toLowerCase()))
        );
      } finally {
        setSearchingAddresses(false);
      }
    }, 400);
  }, [auth]);

  // Section 2
  const [phase, setPhase] = useState<'avant' | 'apres' | null>(null);

  // Section 3
  const [selectedTypes, setSelectedTypes] = useState<DossierType[]>([]);

  const toggleType = (t: DossierType) => {
    setSelectedTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const filteredSuggestions = addressSuggestions;

  const canSubmit =
    (role === 'artisan' ? address.trim().length > 3 : true) &&
    phase !== null &&
    selectedTypes.length > 0;

  const handleSubmit = () => {
    if (!canSubmit) {
      Alert.alert('Champs requis', 'Veuillez compléter toutes les sections avant de continuer.');
      return;
    }
    router.push({
      pathname: '/camera',
      params: {
        phase: phase!,
        types: selectedTypes.join(','),
        address,
      },
    });
  };

  // ─── Section 1: label changes by role ────────────────────────────────
  const section1Title =
    role === 'artisan'
      ? 'Bénéficiaire'
      : role === 'soustraitant'
      ? "Donneur d'ordre"
      : 'Chantier';

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouveau rapport photo</Text>
        <Text style={styles.headerSub}>Remplissez les informations pour démarrer</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* ─── Section 1 ─────────────────────────────────────────────── */}
          <Section>
            <View style={styles.sectionRow}>
              <StepNum n={1} />
              <Text style={styles.sectionTitle}>{section1Title}</Text>
            </View>

            {/* ARTISAN — address autocomplete */}
            {role === 'artisan' && (
              <View style={styles.autocompleteWrapper}>
                <TextInput
                  style={styles.input}
                  value={address}
                  onChangeText={handleAddressChange}
                  placeholder="Adresse du bénéficiaire..."
                  placeholderTextColor={Colors.gray400}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                />
                {searchingAddresses && (
                  <ActivityIndicator size="small" color={Colors.blue} style={{ position: 'absolute', right: 12, top: 14 }} />
                )}
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <View style={styles.dropdown}>
                    {filteredSuggestions.map((s, i) => (
                      <TouchableOpacity
                        key={i}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setAddress(s);
                          setShowSuggestions(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>📍 {s}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* SOUS-TRAITANT — donneur d'ordre select */}
            {role === 'soustraitant' && (
              <View>
                <TouchableOpacity
                  style={styles.selectBtn}
                  onPress={() => setShowCompanyPicker((v) => !v)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.selectBtnText, !companyOrdre && styles.selectBtnPlaceholder]}>
                    {companyOrdre || 'Sélectionner un donneur d\'ordre...'}
                  </Text>
                  <Text style={styles.selectChevron}>▾</Text>
                </TouchableOpacity>
                {showCompanyPicker && (
                  <View style={styles.dropdown}>
                    {companyOptions.map((d) => (
                      <TouchableOpacity
                        key={d}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setCompanyOrdre(d);
                          setShowCompanyPicker(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>🏢 {d}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* OUVRIER — address input (simpler) */}
            {role === 'ouvrier' && (
              <View style={styles.autocompleteWrapper}>
                <TextInput
                  style={styles.input}
                  value={address}
                  onChangeText={(v) => {
                    setAddress(v);
                    setShowSuggestions(v.length > 1);
                  }}
                  placeholder="Adresse du chantier..."
                  placeholderTextColor={Colors.gray400}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                />
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <View style={styles.dropdown}>
                    {filteredSuggestions.map((s, i) => (
                      <TouchableOpacity
                        key={i}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setAddress(s);
                          setShowSuggestions(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>📍 {s}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}
          </Section>

          {/* ─── Section 2: Phase ──────────────────────────────────────── */}
          <Section>
            <View style={styles.sectionRow}>
              <StepNum n={2} />
              <Text style={styles.sectionTitle}>Phase</Text>
            </View>
            <View style={styles.phaseRow}>
              <PhaseOption
                label="Avant travaux"
                icon="🔍"
                selected={phase === 'avant'}
                onSelect={() => setPhase('avant')}
              />
              <PhaseOption
                label="Après travaux"
                icon="✅"
                selected={phase === 'apres'}
                onSelect={() => setPhase('apres')}
              />
            </View>
          </Section>

          {/* ─── Section 3: Types ──────────────────────────────────────── */}
          <Section>
            <View style={styles.sectionRow}>
              <StepNum n={3} />
              <Text style={styles.sectionTitle}>Type d'opération</Text>
            </View>
            <Text style={styles.sectionHint}>Sélectionnez un ou plusieurs types :</Text>
            <View style={styles.typesGrid}>
              {(['PAC', 'BALLON', 'ISOLATION', 'CHAUDIERE'] as DossierType[]).map((t) => (
                <TypeChip
                  key={t}
                  type={t}
                  selected={selectedTypes.includes(t)}
                  onToggle={() => toggleType(t)}
                />
              ))}
            </View>
            {selectedTypes.length > 0 && (
              <View style={styles.photoCountHint}>
                <Text style={styles.photoCountText}>
                  📸 {selectedTypes.length * 3}–{selectedTypes.length * 5} photos requises selon les types sélectionnés
                </Text>
              </View>
            )}
          </Section>

          {/* ─── Submit ────────────────────────────────────────────────── */}
          <TouchableOpacity
            style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit}
            activeOpacity={0.85}
          >
            <Text style={styles.submitBtnText}>📷 Démarrer les photos</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.gray50 },

  header: {
    backgroundColor: Colors.blue,
    paddingHorizontal: 14,
    paddingBottom: 20,
  },
  backBtn: { paddingVertical: 10 },
  backText: { color: Colors.white, fontSize: FontSize.md, fontWeight: FontWeight.medium },
  headerTitle: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.extrabold,
    color: Colors.white,
    marginBottom: 3,
  },
  headerSub: { fontSize: FontSize.md, color: 'rgba(255,255,255,0.75)' },

  scroll: { flex: 1 },
  scrollContent: { padding: 14, gap: 10 },

  // Section card
  section: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: 14,
    ...Shadows.sm,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.gray800,
  },
  sectionHint: {
    fontSize: FontSize.base,
    color: Colors.gray500,
    marginBottom: 10,
  },
  stepNum: {
    width: 22,
    height: 22,
    borderRadius: Radius.sm,
    backgroundColor: Colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.extrabold,
  },

  // Input
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
  autocompleteWrapper: { position: 'relative', zIndex: 10 },

  // Dropdown
  dropdown: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    marginTop: 4,
    ...Shadows.md,
    overflow: 'hidden',
    zIndex: 200,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  dropdownItemText: {
    fontSize: FontSize.md,
    color: Colors.gray700,
  },

  // Select button (company)
  selectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.gray200,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.gray50,
  },
  selectBtnText: {
    flex: 1,
    fontSize: FontSize.xl,
    color: Colors.gray800,
  },
  selectBtnPlaceholder: { color: Colors.gray400 },
  selectChevron: { fontSize: 16, color: Colors.gray500 },

  // Phase
  phaseRow: { flexDirection: 'row', gap: 10 },
  phaseOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: Colors.gray200,
    backgroundColor: Colors.gray50,
  },
  phaseOptionSelected: {
    borderColor: Colors.blue,
    backgroundColor: '#e8f4fc',
  },
  phaseIcon: { fontSize: 18 },
  phaseLabel: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.gray600,
  },
  phaseLabelSelected: { color: Colors.blue },
  phaseCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseCheckText: { color: Colors.white, fontSize: FontSize.sm, fontWeight: FontWeight.bold },

  // Types
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: Colors.gray200,
    backgroundColor: Colors.gray50,
    minWidth: '45%',
    alignItems: 'center',
  },
  typeChipSelected: {
    borderColor: Colors.blue,
    backgroundColor: '#e8f4fc',
  },
  typeChipText: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.gray600,
  },
  typeChipTextSelected: { color: Colors.blue },
  photoCountHint: {
    marginTop: 10,
    backgroundColor: Colors.gray50,
    borderRadius: Radius.md,
    padding: 10,
  },
  photoCountText: {
    fontSize: FontSize.base,
    color: Colors.gray500,
    textAlign: 'center',
  },

  // Submit
  submitBtn: {
    backgroundColor: Colors.pink,
    borderRadius: Radius.xl,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
    ...Shadows.md,
  },
  submitBtnDisabled: {
    backgroundColor: Colors.gray300,
    ...Shadows.sm,
  },
  submitBtnText: {
    color: Colors.white,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
  },
});
