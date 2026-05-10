import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as LocalAuthentication from 'expo-local-authentication';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import 'react-native-reanimated';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import '../global.css';

import Providers from '@/lib/providers';
import { storage } from '@/lib/services/auth';
import { useAuthStore } from '@/lib/store/auth.store';

function BootSplash() {
  const rotateVal = useSharedValue(0);
  const pulseVal = useSharedValue(0.8);

  useEffect(() => {
    rotateVal.value = withRepeat(withTiming(360, { duration: 3000, easing: Easing.linear }), -1);
    pulseVal.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.8, { duration: 900 })
      ),
      -1
    );
  }, []);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateVal.value}deg` }],
  }));
  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseVal.value }],
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(400)}
      className="flex-1 items-center justify-center bg-canvas">
      <Animated.View
        style={[
          ringStyle,
          {
            width: 100,
            height: 100,
            borderRadius: 50,
            borderWidth: 1,
            borderColor: '#4361EE30',
            borderTopColor: '#4361EE',
            position: 'absolute',
          },
        ]}
      />

      <Animated.View style={iconStyle}>
        <View className="h-16 w-16 items-center justify-center rounded-2xl border border-indigo-500/50 bg-indigo-900/60">
          <MaterialCommunityIcons name="shield-check" size={30} color="#4361EE" />
        </View>
      </Animated.View>

      <Text className="absolute bottom-16 text-xs uppercase tracking-widest text-canvas-muted">
        VendorProof
      </Text>
    </Animated.View>
  );
}

function useAuthGuard(isReady: boolean) {
  const segments = useSegments();
  const router = useRouter();
  const { isAuthenticated, setTokens, setVendor, setBiometricEnabled } = useAuthStore();

  useEffect(() => {
    if (!isReady) return;

    const inAuth = segments[0] === '(auth)';
    const inOnboarding = segments[0] === '(onboarding)';

    if (isAuthenticated) {
      if (inAuth) router.replace('/(tabs)');
    } else {
      if (!inAuth && !inOnboarding) router.replace('/(auth)/login');
    }
  }, [isAuthenticated, segments, isReady]);
}

export default function RootLayout() {
  const [booting, setBooting] = useState(true);
  const { setTokens, setVendor, setBiometricEnabled, isAuthenticated } = useAuthStore();

  const [loaded] = useFonts({
    DMSans: require('@/assets/fonts/DMSans-VariableFont_opsz,wght.ttf'),
  });

  useEffect(() => {
    const boot = async () => {
      try {
        const { access, refresh } = await storage.getTokens();

        if (!access || !refresh) {
          setBooting(false);
          return;
        }

        const vendor = await storage.getVendor();
        const biometricStored = await storage.getBiometricEnabled();

        if (biometricStored) {
          const hasBio = await LocalAuthentication.hasHardwareAsync();
          const isEnrolled = await LocalAuthentication.isEnrolledAsync();

          if (hasBio && isEnrolled) {
            const result = await LocalAuthentication.authenticateAsync({
              promptMessage: 'Sign in to VendorProof',
              fallbackLabel: 'Use OTP instead',
              disableDeviceFallback: false,
            });

            if (result.success) {
              setTokens(access, refresh);
              if (vendor) setVendor(vendor);
              setBiometricEnabled(true);
              setBooting(false);
              return;
            }
          }
        } else {
          setTokens(access, refresh);
          if (vendor) setVendor(vendor);
        }
      } catch (e) {
        await storage.clearAll();
      } finally {
        setBooting(false);
      }
    };

    if (loaded) boot();
  }, [loaded]);

  useAuthGuard(!booting && loaded);

  if (!loaded || booting) {
    return <BootSplash />;
  }

  return (
    <Providers>
      <ThemeProvider value={DarkTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
          <Stack.Screen name="(onboarding)" options={{ animation: 'fade' }} />
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        </Stack>
        <StatusBar style="light" />
      </ThemeProvider>
    </Providers>
  );
}
