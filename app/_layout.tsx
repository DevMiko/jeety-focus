import { AuthProvider } from '@/context/AuthContext';
import { RoleProvider } from '@/hooks/use-role';
import { initCertificall } from '@/services/certificall';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    initCertificall().catch(console.warn);
  }, []);

  return (
    <AuthProvider>
      <RoleProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)/welcome" />
          <Stack.Screen name="(auth)/login" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="detail" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="rapport-detail" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="camera" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="create" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="success" options={{ animation: 'fade' }} />
          <Stack.Screen name="guide" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="ouvriers" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="add-ouvrier" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="sous-traitants" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="team" options={{ animation: 'slide_from_right' }} />
        </Stack>
        <StatusBar style="light" />
      </RoleProvider>
    </AuthProvider>
  );
}
