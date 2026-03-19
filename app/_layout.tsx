import { AuthProvider } from '@/context/AuthContext';
import { RoleProvider } from '@/hooks/use-role';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <AuthProvider>
      <RoleProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)/welcome" />
          <Stack.Screen name="(auth)/login" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="detail" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="camera" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="create" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="success" options={{ animation: 'fade' }} />
          <Stack.Screen name="guide" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="team" options={{ animation: 'slide_from_right' }} />
        </Stack>
        <StatusBar style="light" />
      </RoleProvider>
    </AuthProvider>
  );
}
