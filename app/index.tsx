import { Redirect } from 'expo-router';

// Entry point: always go to welcome so user picks their role
export default function Index() {
  return <Redirect href="/(auth)/welcome" />;
}
