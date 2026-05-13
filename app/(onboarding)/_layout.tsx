import useUser from '@/lib/hooks/use-user';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

export default function OnboardingLayout() {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace('/(tabs)');
  }, [user]);

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#080B12' },
          animation: 'slide_from_right',
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="register" />
        <Stack.Screen name="document" />
        <Stack.Screen name="kyc-identity" />
        <Stack.Screen name="processing" />
        <Stack.Screen name="result" />
      </Stack>

      <StatusBar style="light" />
    </>
  );
}
