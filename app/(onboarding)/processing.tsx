import { Button } from '@/components/onboarding/shared';
import { storage } from '@/lib/config/storage';
import { useAuthStore } from '@/lib/store/auth.store';
import { useOnboardingStore } from '@/lib/store/onboarding.store';
import { AntDesign, FontAwesome6 } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProcessingScreen() {
  const router = useRouter();
  const { setStep } = useOnboardingStore();

  const ringRotate = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { accessToken } = useLocalSearchParams<{ accessToken: string }>();
  const { setTokens } = useAuthStore();

  const handleContinue = async () => {
    await storage.setTokens(accessToken!);
    setTokens(accessToken!);
    router.replace('/(tabs)');
  };

  useEffect(() => {
    setStep(4);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.timing(ringRotate, {
        toValue: 1,
        duration: 2800,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const ringDeg = ringRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <View className="flex-1 justify-center px-6">
        <Animated.View style={{ opacity: fadeAnim }} className="items-center">
          <View className="relative mb-10 h-32 w-32 items-center justify-center">
            <Animated.View
              style={{ transform: [{ rotate: ringDeg }] }}
              className="absolute inset-0 rounded-full border-2 border-indigo-500/30"
            />

            <View className="h-24 w-24 items-center justify-center rounded-full border border-canvas-border bg-canvas-surface">
              <FontAwesome6 name="shield-halved" size={48} color="#6366F1" />
            </View>
          </View>

          <Text className="mb-3 text-2xl font-medium text-white">Processing your Trust Score</Text>

          <Text className="mb-8 max-w-[280px] text-center text-base text-canvas-muted">
            This usually takes 1–2 minutes.{' '}
            <Text className="text-white">We'll notify you once it's ready.</Text>
          </Text>

          <Text className="mb-10 text-xs uppercase tracking-widest text-canvas-muted">
            YOUR APPLICATION IS IN QUEUE
          </Text>
        </Animated.View>
      </View>

      <View className="px-6 pb-8">
        <Button
          label="Go to Dashboard"
          variant="outline"
          onPress={handleContinue}
          rightIcon={<AntDesign name="arrow-right" size={20} color="#A1A1AA" />}
        />
      </View>
    </SafeAreaView>
  );
}
