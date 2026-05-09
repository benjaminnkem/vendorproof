import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: { mutations: { retry: 0 } },
});

export default function AuthLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="login"  />
        <Stack.Screen name="verify" options={{ animation: 'slide_from_right' }} />
      </Stack>
    </QueryClientProvider>
  );
}
