import { Button, Card } from '@/components/onboarding/shared';
import queryClient from '@/lib/config/query-client';
import { useOnboardingStore } from '@/lib/store/onboarding.store';
import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ResultScreen() {
  const router = useRouter();
  const { data } = useOnboardingStore();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    queryClient.invalidateQueries({ predicate: (query) => query.queryKey.includes('user') });
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <View className="flex-1 px-6 pt-12">
        <Animated.View style={{ opacity: fadeAnim }} className="items-center">
          <View className="mb-6 h-20 w-20 items-center justify-center rounded-full border border-amber-500/30 bg-amber-900/30">
            <AntDesign name="clock-circle" size={48} color="#F59E0B" />
          </View>

          <Text className="mb-2 text-center text-3xl font-medium text-white">
            Application Submitted
          </Text>

          <Text className="mb-8 text-center text-lg text-amber-400">Trust Score under review</Text>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <Card className="mb-8">
            <Text className="mb-4 text-center text-sm text-canvas-muted">
              Your business information has been received and is now being processed.
            </Text>
            <Text className="text-center text-sm leading-relaxed text-canvas-muted">
              You will receive a notification when your Trust Score and Badge are ready. This
              usually takes a few minutes.
            </Text>
          </Card>
        </Animated.View>

        <View className="flex-1" />

        <Animated.View style={{ opacity: fadeAnim }} className="pb-8">
          <Button
            label="Go to Dashboard"
            onPress={() => router.replace('/(tabs)')}
            rightIcon={<AntDesign name="arrow-right" size={20} color="#fff" />}
          />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
