import { Stack } from 'expo-router';
import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';
import { supabase } from '@/lib/supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  const url = Linking.useURL();

  useEffect(() => {
    async function setup() {
      await Notifications.requestPermissionsAsync();
    }
    setup();

    // Deep link handling is automatically routed by Expo Router
  }, [url]);

  useEffect(() => {
    // Basic session check on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      // Session check complete
    });
  }, []);

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTitleStyle: {
          fontWeight: '900',
          fontSize: 22,
        },
        headerShadowVisible: false,
      }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ title: 'Login' }} />
    </Stack>
  );
}
