import { TypeBadge } from '@/components/ui/badge';
import { StatusBlock } from '@/components/ui/status-block';
import type { Dossier, Role } from '@/constants/mock-data';
import { Colors, FontSize, FontWeight, Radius, Shadows } from '@/constants/theme';
import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DossierCardProps {
  dossier: Dossier;
  role: Role;
  onPress: (dossier: Dossier) => void;
  isSelected?: boolean;
}

export function DossierCard({ dossier, role, onPress, isSelected }: DossierCardProps) {
  const handlePhonePress = (e: any) => {
    e.stopPropagation();
    Linking.openURL(`tel:${dossier.phone.replace(/\s/g, '')}`);
  };

  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.cardSelected]}
      onPress={() => onPress(dossier)}
      activeOpacity={0.85}
    >
      {/* Top row */}
      <View style={styles.top}>
        <View style={styles.info}>
          <Text style={styles.ref}>{dossier.ref}</Text>
          <Text style={styles.name} numberOfLines={1}>{dossier.clientName}</Text>
          <Text style={styles.address} numberOfLines={1}>{dossier.address}</Text>
          <TouchableOpacity onPress={handlePhonePress}>
            <Text style={styles.phone}>📞 {dossier.phone}</Text>
          </TouchableOpacity>
          {dossier.donneurOrdre && (role === 'soustraitant' || role === 'ouvrier') && (
            <Text style={styles.donneurLabel}>via {dossier.donneurOrdre}</Text>
          )}
        </View>
        <View style={styles.badges}>
          {dossier.types.map((t) => (
            <TypeBadge key={t} type={t} />
          ))}
        </View>
      </View>

      {/* Status row */}
      <View style={styles.statusRow}>
        <StatusBlock
          label="Avant travaux"
          status={dossier.avantStatus}
          ref={dossier.avantRef}
          date={dossier.avantDate}
        />
        <StatusBlock
          label="Après travaux"
          status={dossier.apresStatus}
        />
      </View>

      {/* Assigned label */}
      {dossier.assignedTo && (
        <View style={styles.assignedRow}>
          <Text style={styles.assignedIcon}>👤</Text>
          <Text style={styles.assignedText}>{dossier.assignedTo}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    ...Shadows.sm,
  },
  cardSelected: {
    borderColor: Colors.blue,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  ref: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.extrabold,
    color: Colors.blue,
    marginBottom: 2,
  },
  name: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.gray800,
  },
  address: {
    fontSize: FontSize.base,
    color: Colors.gray500,
    marginTop: 1,
  },
  phone: {
    fontSize: FontSize.sm,
    color: Colors.blue,
    marginTop: 2,
  },
  donneurLabel: {
    fontSize: FontSize.sm,
    color: Colors.gray400,
    marginTop: 2,
  },
  badges: {
    flexDirection: 'column',
    gap: 3,
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 6,
  },
  assignedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
  },
  assignedIcon: {
    fontSize: 11,
  },
  assignedText: {
    fontSize: FontSize.sm,
    color: Colors.gray500,
    fontWeight: FontWeight.medium,
  },
});
