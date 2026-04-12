import { Colors, FontSize, FontWeight } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/hooks/use-role';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function TabIcon({
  icon,
  focused,
  badge,
}: {
  icon: string;
  focused: boolean;
  badge?: number;
}) {
  return (
    <View style={tabStyles.iconWrapper}>
      <Text style={[tabStyles.icon, focused && tabStyles.iconActive]}>{icon}</Text>
      {badge !== undefined && badge > 0 && (
        <View style={tabStyles.badge}>
          <Text style={tabStyles.badgeText}>{badge}</Text>
        </View>
      )}
    </View>
  );
}

const tabStyles = StyleSheet.create({
  iconWrapper: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 20, opacity: 0.45 },
  iconActive: { opacity: 1 },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: Colors.pink,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.extrabold,
  },
});

export default function TabLayout() {
  const { role } = useRole();
  const { rapports } = useAuth();
  const insets = useSafeAreaInsets();

  // Nombre de rapports libres (non rattachés à un dossier)
  const rapportsLibresCount = rapports.filter((r) => !r.id_dossier).length;

  const tab1Label = role === 'ouvrier' ? 'Mes chantiers' : 'Dossiers Jeety';
  const tab3Label = role === 'ouvrier' ? 'Mon profil' : 'Profil & équipe';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.blue,
        tabBarInactiveTintColor: Colors.gray400,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: Colors.gray100,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 8,
          height: 58 + (insets.bottom > 0 ? insets.bottom : 10),
        },
        tabBarLabelStyle: {
          fontSize: FontSize.xs,
          fontWeight: FontWeight.medium,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: tab1Label,
          tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="rapports"
        options={{
          title: 'Rapports libres',
          tabBarIcon: ({ focused }) => <TabIcon icon="📋" focused={focused} badge={rapportsLibresCount} />,
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: tab3Label,
          tabBarIcon: ({ focused }) => <TabIcon icon="👤" focused={focused} />,
        }}
      />
      {/* Legacy file — hidden from tab bar */}
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}
