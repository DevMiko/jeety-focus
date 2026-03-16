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

interface Section {
  id: string;
  icon: string;
  title: string;
  content: string;
  roles?: ('artisan' | 'soustraitant' | 'ouvrier')[];
}

const SECTIONS: Section[] = [
  {
    id: 'what',
    icon: '🎯',
    title: "C'est quoi Jeety Focus ?",
    content:
      "Jeety Focus est l'application mobile qui accompagne votre activité terrain. Elle vous permet de prendre des photos géolocalisées et horodatées avant et après vos travaux, et de générer des rapports photo certifiés directement depuis votre smartphone.\n\nChaque photo est automatiquement associée au dossier CEE correspondant dans le CRM Jeety.",
  },
  {
    id: 'how',
    icon: '📋',
    title: 'Comment ça marche ?',
    content:
      "1. Sélectionnez un dossier dans la liste\n2. Appuyez sur « Avant travaux » pour démarrer la session photo\n3. Suivez la checklist : chaque photo requise est indiquée\n4. Prenez les photos dans l'ordre suggéré\n5. Répétez après les travaux pour les photos « Après »\n6. Le rapport PDF est généré automatiquement et synchronisé dans Jeety CRM",
  },
  {
    id: 'filters',
    icon: '🔍',
    title: 'Utiliser les filtres',
    content:
      "Les filtres en haut de la liste vous permettent de trier rapidement :\n\n• Étape : Avant / Après / OK — filtre par statut du rapport\n• Type : PAC / Ballon / Isolation / Chaudière — filtre par type d'opération\n• Poseur : filtrer par ouvrier ou sous-traitant assigné\n\nTous les filtres sont combinables.",
    roles: ['artisan', 'soustraitant'],
  },
  {
    id: 'team',
    icon: '👥',
    title: 'Gérer votre équipe',
    content:
      "Depuis l'onglet « Profil & équipe », vous pouvez :\n\n• Voir vos ouvriers et leur statut d'activation\n• Envoyer une invitation SMS à un ouvrier\n• Assigner un ouvrier à un dossier via le bouton d'affectation\n• Suivre les rapports générés par chaque membre",
    roles: ['artisan', 'soustraitant'],
  },
  {
    id: 'soustraitance',
    icon: '🏗️',
    title: 'Sous-traitance',
    content:
      "Les sous-traitants apparaissent automatiquement lorsqu'un artisan vous assigne via votre SIRET.\n\nEn tant qu'artisan, vous pouvez :\n• Consulter vos sous-traitants liés dans le CRM\n• Inviter un sous-traitant à rejoindre Jeety Focus\n• Suivre leurs rapports photo depuis votre interface",
    roles: ['artisan'],
  },
  {
    id: 'employer',
    icon: '🏢',
    title: 'Mon employeur',
    content:
      "Votre employeur vous a invité via SMS. Votre compte est lié à son entreprise dans Jeety.\n\nVous pouvez voir les chantiers qui vous ont été assignés dans l'onglet « Mes chantiers ».\n\nSi vous avez des questions, contactez votre responsable ou envoyez-nous un message via le support.",
    roles: ['ouvrier'],
  },
  {
    id: 'photos',
    icon: '📸',
    title: 'Conseils pour les photos',
    content:
      "Pour que vos photos soient acceptées :\n\n✅ Prenez des photos nettes et bien éclairées\n✅ Cadrez l'équipement entier dans le champ\n✅ Assurez-vous que la plaque signalétique soit lisible\n✅ Activez la localisation GPS de votre téléphone\n✅ En extérieur, incluez la façade de la maison\n\n❌ Évitez les doigts dans le champ\n❌ Évitez les contre-jours",
  },
  {
    id: 'support',
    icon: '💬',
    title: 'Support & contact',
    content:
      "Besoin d'aide ?\n\n📧 support@jeety.fr\n🌐 www.jeety.fr/aide\n\nNotre équipe est disponible du lundi au vendredi de 9h à 18h.\n\nVersion de l'application : 1.0.0",
  },
];

// ─── Accordion Item ───────────────────────────────────────────────────────────
function AccordionItem({ section }: { section: Section }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.accordionItem}>
      <TouchableOpacity
        style={styles.accordionHeader}
        onPress={() => setOpen((v) => !v)}
        activeOpacity={0.8}
      >
        <View style={styles.accordionLeft}>
          <Text style={styles.accordionIcon}>{section.icon}</Text>
          <Text style={styles.accordionTitle}>{section.title}</Text>
        </View>
        <Text style={[styles.accordionChevron, open && styles.accordionChevronOpen]}>›</Text>
      </TouchableOpacity>
      {open && (
        <View style={styles.accordionBody}>
          <Text style={styles.accordionText}>{section.content}</Text>
        </View>
      )}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function GuideScreen() {
  const router = useRouter();
  const { role } = useRole();

  const visibleSections = SECTIONS.filter(
    (s) => !s.roles || s.roles.includes(role ?? 'artisan')
  );

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📖 Guide d'utilisation</Text>
        <Text style={styles.headerSubtitle}>Tout ce qu'il faut savoir pour utiliser Jeety Focus</Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentPadding}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.accordionList}>
          {visibleSections.map((section) => (
            <AccordionItem key={section.id} section={section} />
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Jeety Focus • v1.0.0 • jeety.fr</Text>
        </View>
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
  header: {
    backgroundColor: Colors.blue,
    paddingHorizontal: 14,
    paddingBottom: 20,
  },
  backBtn: {
    paddingVertical: 10,
  },
  backText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  headerTitle: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.extrabold,
    color: Colors.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: FontSize.md,
    color: 'rgba(255,255,255,0.75)',
  },

  content: { flex: 1 },
  contentPadding: {
    padding: 14,
    paddingBottom: 40,
  },

  accordionList: {
    gap: 8,
  },
  accordionItem: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  accordionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  accordionIcon: {
    fontSize: 20,
    width: 28,
    textAlign: 'center',
  },
  accordionTitle: {
    flex: 1,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.gray800,
  },
  accordionChevron: {
    fontSize: 22,
    color: Colors.gray400,
    transform: [{ rotate: '0deg' }],
    fontWeight: FontWeight.bold,
  },
  accordionChevronOpen: {
    transform: [{ rotate: '90deg' }],
    color: Colors.blue,
  },
  accordionBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
  },
  accordionText: {
    fontSize: FontSize.md,
    color: Colors.gray600,
    lineHeight: 22,
    paddingTop: 10,
  },

  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: FontSize.sm,
    color: Colors.gray400,
  },
});
