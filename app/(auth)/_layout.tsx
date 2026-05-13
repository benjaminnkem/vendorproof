import useUser from '@/lib/hooks/use-user';
import { useAuthStore } from '@/lib/store/auth.store';
import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function AuthLayout() {
  const { user } = useUser();
  const router = useRouter();
  const { accessToken } = useAuthStore();

  useEffect(() => {
    if (accessToken && user) router.replace('/(tabs)');
  }, [accessToken, user]);

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="verify" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}
