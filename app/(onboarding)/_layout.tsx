import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function OnboardingLayout() {
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
        <Stack.Screen name="selfie" />
        <Stack.Screen name="processing" />
        <Stack.Screen name="result" />
      </Stack>

      <StatusBar style="light" />
    </>
  );
}
