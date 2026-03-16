import { Colors, FontSize, FontWeight, Radius, Shadows } from '@/constants/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    phase?: string;
    dossierRef?: string;
    photoCount?: string;
    reportNumber?: string;
    certifiedAt?: string;
    pdfUrl?: string;
  }>();

  const phase = params.phase ?? 'avant';
  const rfNumber = params.reportNumber ?? 'RF-PENDING';
  const photoCount = params.photoCount ?? '0';
  const certifiedAt = params.certifiedAt ?? (() => {
    const now = new Date();
    return `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  })();
  const pdfUrl = params.pdfUrl ?? '';

  return (
    <SafeAreaView style={styles.screen}>
      {/* ─── Green header ─── */}
      <View style={styles.header}>
        <View style={styles.checkCircle}>
          <Text style={styles.checkIcon}>✓</Text>
        </View>
        <Text style={styles.headerTitle}>Rapport généré !</Text>
        <Text style={styles.headerSubtitle}>
          Photos horodatées et géolocalisées
        </Text>
      </View>

      {/* ─── Report card ─── */}
      <View style={styles.content}>
        <View style={styles.card}>
          {/* RF Number */}
          <View style={styles.rfRow}>
            <View style={styles.rfBadge}>
              <Text style={styles.rfBadgeText}>📄 Rapport</Text>
            </View>
            <Text style={styles.rfNumber}>{rfNumber}</Text>
          </View>

          <View style={styles.divider} />

          {/* Details */}
          <View style={styles.detailsList}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Phase</Text>
              <Text style={styles.detailValue}>
                {phase === 'avant' ? '📷 Avant travaux' : '📷 Après travaux'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Photos</Text>
              <Text style={styles.detailValue}>{photoCount} photo(s)</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{certifiedAt}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Géolocalisation</Text>
              <View style={styles.gpsBadge}>
                <Text style={styles.gpsBadgeText}>✅ Géolocalisé</Text>
              </View>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Horodatage</Text>
              <View style={styles.gpsBadge}>
                <Text style={styles.gpsBadgeText}>✅ Certifié</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ─── Actions ─── */}
        <TouchableOpacity
          style={styles.btnDownload}
          onPress={() =>
            pdfUrl
              ? Alert.alert('PDF disponible', pdfUrl)
              : Alert.alert('PDF', 'Le PDF Certificall sera disponible une fois les credentials configurés.')
          }
          activeOpacity={0.85}
        >
          <Text style={styles.btnDownloadText}>📥 Télécharger le PDF</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnHome}
          onPress={() => router.replace('/(tabs)')}
          activeOpacity={0.85}
        >
          <Text style={styles.btnHomeText}>← Retour à l'accueil</Text>
        </TouchableOpacity>

        {/* Info box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoBoxIcon}>💡</Text>
          <Text style={styles.infoBoxText}>
            Le rapport a été synchronisé avec votre CRM Jeety et est disponible dans l'onglet <Text style={styles.infoBoxBold}>Rapports libres</Text>.
          </Text>
        </View>
      </View>
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
    backgroundColor: Colors.green,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 30,
    alignItems: 'center',
  },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  checkIcon: {
    fontSize: 36,
    color: Colors.white,
    fontWeight: FontWeight.extrabold,
  },
  headerTitle: {
    fontSize: FontSize['3xl'],
    fontWeight: FontWeight.extrabold,
    color: Colors.white,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: FontSize.md,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
  },

  content: {
    flex: 1,
    padding: 16,
  },

  // Card
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: 16,
    marginBottom: 14,
    ...Shadows.md,
  },
  rfRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  rfBadge: {
    backgroundColor: Colors.gray100,
    borderRadius: Radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  rfBadgeText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.gray600,
  },
  rfNumber: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.extrabold,
    color: Colors.blue,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray100,
    marginBottom: 12,
  },
  detailsList: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: FontSize.base,
    color: Colors.gray500,
  },
  detailValue: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.gray700,
  },
  gpsBadge: {
    backgroundColor: '#dcfce7',
    borderRadius: Radius.xs,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  gpsBadgeText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.green,
  },

  // Buttons
  btnDownload: {
    backgroundColor: Colors.blue,
    borderRadius: Radius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  btnDownloadText: {
    color: Colors.white,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  btnHome: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.gray200,
    marginBottom: 16,
  },
  btnHomeText: {
    color: Colors.gray700,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
  },

  // Info box
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#fef3c7',
    borderRadius: Radius.lg,
    padding: 12,
  },
  infoBoxIcon: { fontSize: 16, marginTop: 1 },
  infoBoxText: {
    flex: 1,
    fontSize: FontSize.base,
    color: '#92400e',
    lineHeight: 18,
  },
  infoBoxBold: {
    fontWeight: FontWeight.bold,
  },
});
