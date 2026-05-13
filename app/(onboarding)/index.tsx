import { Button } from '@/components/onboarding/shared';
import useUser from '@/lib/hooks/use-user';
import { useOnboardingStore } from '@/lib/store/onboarding.store';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

function HexGrid() {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const scale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.97, 1.03],
  });

  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace('/(tabs)');
  }, [user]);

  return (
    <Animated.View
      style={{ opacity, transform: [{ scale }] }}
      className="items-center justify-center">
      <View
        className="h-52 w-52 items-center justify-center"
        style={{
          borderWidth: 0.5,
          borderColor: '#4361EE40',
          borderRadius: 8,
          transform: [{ rotate: '15deg' }],
        }}>
        <View
          className="h-36 w-36 items-center justify-center"
          style={{
            borderWidth: 0.8,
            borderColor: '#4361EE70',
            borderRadius: 6,
            transform: [{ rotate: '-8deg' }],
          }}>
          <View
            className="h-20 w-20 items-center justify-center bg-indigo-900"
            style={{
              borderWidth: 1,
              borderColor: '#4361EE',
              borderRadius: 5,
              transform: [{ rotate: '5deg' }],
            }}>
            <MaterialCommunityIcons name="shield-check" size={36} color="#818CF8" />
          </View>
        </View>
      </View>

      {[0, 60, 120, 180, 240, 300].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const r = 110;
        const x = Math.cos(rad) * r;
        const y = Math.sin(rad) * r;
        return (
          <View
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full bg-indigo-400"
            style={{
              transform: [{ translateX: x }, { translateY: y }],
              opacity: 0.5 + (i % 3) * 0.15,
            }}
          />
        );
      })}

      <View
        className="absolute"
        style={{
          top: 0,
          left: 0,
          width: 20,
          height: 20,
          borderTopWidth: 1.5,
          borderLeftWidth: 1.5,
          borderColor: '#20C997',
        }}
      />
      <View
        className="absolute"
        style={{
          bottom: 0,
          right: 0,
          width: 20,
          height: 20,
          borderBottomWidth: 1.5,
          borderRightWidth: 1.5,
          borderColor: '#20C997',
        }}
      />
    </Animated.View>
  );
}

const trustIndicators = [
  {
    icon: <MaterialCommunityIcons name="brain" size={14} color="#20C997" />,
    label: 'AI-scored',
    sub: 'Smart risk analysis',
  },
  {
    icon: <Feather name="zap" size={14} color="#20C997" />,
    label: 'Instant badge',
    sub: 'Live in minutes',
  },
  {
    icon: <MaterialCommunityIcons name="shield-lock-outline" size={14} color="#20C997" />,
    label: 'Squad-secured',
    sub: 'End-to-end protected',
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const reset = useOnboardingStore((s) => s.reset);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    reset();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <View className="absolute inset-0 opacity-5">
        {Array.from({ length: 12 }).map((_, row) =>
          Array.from({ length: 8 }).map((_, col) => (
            <View
              key={`${row}-${col}`}
              className="absolute border border-indigo-400"
              style={{
                width: width / 8,
                height: width / 8,
                left: col * (width / 8),
                top: row * (width / 8),
              }}
            />
          ))
        )}
      </View>

      <View className="flex-1 justify-between px-6 py-8">
        <View className="flex-row items-center gap-2">
          <View className="h-1.5 w-1.5 rounded-full bg-teal-500" />
          <Text className="text-xs uppercase tracking-widest text-canvas-muted">
            Squad Hackathon 3.0
          </Text>
        </View>

        <Animated.View style={{ opacity: fadeAnim }} className="flex-1 items-center justify-center">
          <HexGrid />
        </Animated.View>

        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}>
          <Text className="mb-3 text-xs uppercase tracking-widest text-canvas-muted">
            Trust infrastructure
          </Text>
          <Text className="mb-4 text-4xl font-extrabold leading-tight text-white">
            Your business,{'\n'}
            <Text className="text-indigo-400">verified.</Text>
          </Text>
          <Text className="mb-10 text-sm leading-relaxed text-canvas-muted">
            Get an AI-powered Trust Badge that tells buyers you're real — and unlocks higher Squad
            payment limits.
          </Text>

          <View className="gap-3">
            <Button
              label="Get verified →"
              onPress={() => router.push('/(onboarding)/register')}
              variant="primary"
            />
            <Button
              label="I already have an account"
              onPress={() => router.replace('/(auth)/login')}
              variant="ghost"
            />
          </View>

          <View className="mt-8 flex-row justify-center gap-6">
            {['AI-scored', 'Squad-powered', 'Instant badge'].map((label) => (
              <View key={label} className="items-center gap-1">
                <View className="h-1 w-1 rounded-full bg-teal-500" />
                <Text className="text-xs text-canvas-muted">{label}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
