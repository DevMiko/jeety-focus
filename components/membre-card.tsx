import { Avatar } from '@/components/ui/avatar';
import type { TeamMember } from '@/constants/mock-data';
import { Colors, FontSize, FontWeight, Radius, Shadows } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface MembreCardProps {
  membre: TeamMember;
  onInvite?: () => void;
  onRemove?: () => void;
}

export function MembreCard({ membre, onInvite, onRemove }: MembreCardProps) {
  const isActive = membre.status === 'active';

  return (
    <View style={[styles.card, !isActive && styles.cardPending]}>
      <Avatar
        initials={membre.initials}
        size={44}
        backgroundColor={Colors.blue}
        borderRadius={Radius.round}
      />
      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text style={styles.name}>{membre.firstName} {membre.lastName}</Text>
          {membre.hasJeety && (
            <View style={styles.jeetyBadge}>
              <Text style={styles.jeetyText}>✓ Jeety Focus</Text>
            </View>
          )}
        </View>
        <Text style={styles.phone}>{membre.phone}</Text>
        <Text style={[styles.status, isActive ? styles.statusActive : styles.statusPending]}>
          {isActive ? 'Actif' : '⏳ En attente d\'activation'}
        </Text>
        {membre.rapportCount !== undefined && (
          <Text style={styles.rapportCountText}>{membre.rapportCount} rapports</Text>
        )}
      </View>
      <View style={styles.actions}>
        {!membre.hasJeety && onInvite && (
          <TouchableOpacity style={styles.inviteBtn} onPress={onInvite}>
            <Text style={styles.inviteBtnText}>Inviter</Text>
          </TouchableOpacity>
        )}
        {onRemove && (
          <TouchableOpacity onPress={onRemove} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.removeBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── Placeholder card (ajout) ─────────────────────────────────────────────────
interface AddMembreCardProps {
  label: string;
  onPress: () => void;
}

export function AddMembreCard({ label, onPress }: AddMembreCardProps) {
  return (
    <TouchableOpacity style={styles.addCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.addIcon}>
        <Text style={styles.addIconText}>+</Text>
      </View>
      <Text style={styles.addLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
    ...Shadows.sm,
  },
  cardPending: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.gray300,
    ...({ shadowOpacity: 0 } as any),
    elevation: 0,
  },
  info: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  name: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.gray800,
  },
  jeetyBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Radius.xs,
  },
  jeetyText: {
    fontSize: FontSize.xs,
    color: Colors.green,
    fontWeight: FontWeight.bold,
  },
  phone: {
    fontSize: FontSize.sm,
    color: Colors.gray500,
    marginTop: 2,
  },
  status: {
    fontSize: FontSize.sm,
    marginTop: 2,
    fontWeight: FontWeight.medium,
  },
  statusActive: {
    color: Colors.green,
  },
  statusPending: {
    color: Colors.orange,
  },
  rapportCountText: {
    fontSize: FontSize.sm,
    color: Colors.gray400,
    marginTop: 2,
  },
  actions: {
    alignItems: 'center',
    gap: 8,
  },
  inviteBtn: {
    backgroundColor: Colors.blue,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.md,
  },
  inviteBtnText: {
    color: Colors.white,
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
  },
  removeBtn: {
    fontSize: 16,
    color: Colors.gray400,
  },
  // Add card
  addCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: 14,
    marginBottom: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.gray300,
  },
  addIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.round,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIconText: {
    fontSize: 24,
    color: Colors.gray400,
    fontWeight: FontWeight.regular,
    lineHeight: 28,
  },
  addLabel: {
    fontSize: FontSize.xl,
    color: Colors.gray500,
    fontWeight: FontWeight.medium,
  },
});
