import { verifyOnboardingFeePayment } from '@/lib/services/payment-api';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

function LoadingState() {
  const rotate = useSharedValue(0);
  const pulse = useSharedValue(0.8);

  useEffect(() => {
    rotate.value = withRepeat(withTiming(360, { duration: 1400, easing: Easing.linear }), -1);
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.8, { duration: 900 })
      ),
      -1
    );
  }, []);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <View className="flex-1 items-center justify-center px-8">
        <Animated.View entering={FadeIn.duration(400)} className="items-center">
          <View className="mb-8 items-center justify-center" style={{ width: 120, height: 120 }}>
            <Animated.View
              style={pulseStyle}
              className="absolute h-28 w-28 rounded-full bg-indigo-900/30"
            />
            <Animated.View
              style={[
                spinStyle,
                {
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  borderWidth: 2,
                  borderColor: '#4361EE',
                  borderTopColor: 'transparent',
                  position: 'absolute',
                },
              ]}
            />
            <View className="h-14 w-14 items-center justify-center rounded-full border border-indigo-500/30 bg-canvas-surface">
              <MaterialCommunityIcons name="shield-check" size={26} color="#4361EE" />
            </View>
          </View>

          <Text className="mb-2 text-xl font-semibold text-white">Verifying payment</Text>
          <Text className="text-center text-sm leading-relaxed text-canvas-muted">
            Confirming your ₦500 onboarding fee with Squad. This only takes a moment.
          </Text>

          <View className="mt-8 flex-row items-center gap-2 rounded-2xl border border-canvas-border bg-canvas-surface px-5 py-3">
            <View className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
            <Text className="text-xs text-canvas-muted">Secured by Squad</Text>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <View className="flex-1 items-center justify-center px-8">
        <Animated.View entering={FadeInDown.delay(60).springify()} className="items-center">
          <View className="mb-6 h-20 w-20 items-center justify-center rounded-full border border-alert-700/40 bg-alert-900/40">
            <Ionicons name="close-circle-outline" size={36} color="#E63946" />
          </View>

          <Text className="mb-2 text-center text-xl font-semibold text-white">
            Verification failed
          </Text>
          <Text className="mb-8 text-center text-sm leading-relaxed text-canvas-muted">
            We couldn't confirm your payment. Your funds are safe — please try again or contact
            support if the issue persists.
          </Text>

          <View className="w-full gap-3">
            <TouchableOpacity
              onPress={onRetry}
              className="items-center rounded-2xl bg-indigo-500 py-4 active:bg-indigo-700">
              <Text className="text-sm font-semibold text-white">Try again</Text>
            </TouchableOpacity>

            <View className="flex-row items-start gap-3 rounded-2xl border border-canvas-border bg-canvas-surface px-4 py-3.5">
              <Ionicons name="information-circle-outline" size={15} color="#7B8FF7" />
              <Text className="flex-1 text-xs leading-relaxed text-indigo-300/70">
                If your payment was deducted, it will be refunded within 24 hours. Reference:{' '}
                <Text className="font-medium text-indigo-300">—</Text>
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

function SuccessState() {
  const router = useRouter();
  const scale = useSharedValue(0);
  const ringScale = useSharedValue(0);
  const ringOpacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 180 });

    setTimeout(() => {
      ringScale.value = withTiming(2.2, { duration: 700, easing: Easing.out(Easing.quad) });
      ringOpacity.value = withTiming(0, { duration: 700 });
    }, 200);
  }, []);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  const { from, accessToken } = useLocalSearchParams<{ from: string; accessToken: string }>();

  const handleContinue = () => {
    if (from === 'business-profile') {
      router.replace({ pathname: '/(onboarding)/processing', params: { accessToken } });
    } else {
      router.replace({ pathname: '/(onboarding)/processing', params: { accessToken } });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <View className="flex-1 items-center justify-center px-8">
        <View className="items-center">
          <View className="mb-8 items-center justify-center" style={{ width: 120, height: 120 }}>
            <Animated.View
              style={[
                ringStyle,
                {
                  position: 'absolute',
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  borderWidth: 2,
                  borderColor: '#20C997',
                },
              ]}
            />
            <Animated.View
              style={iconStyle}
              className="h-20 w-20 items-center justify-center rounded-full border-2 border-teal-500 bg-teal-900/60">
              <Ionicons name="checkmark" size={38} color="#20C997" />
            </Animated.View>
          </View>

          <Animated.View entering={FadeInDown.delay(300).springify()} className="mb-8 items-center">
            <Text className="mb-2 text-center text-2xl font-semibold text-white">
              Payment confirmed
            </Text>
            <Text className="text-center text-sm leading-relaxed text-canvas-muted">
              Your ₦500 onboarding fee has been received. You're now ready to complete your identity
              verification.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(420)} className="mb-6 w-full gap-3">
            <View className="overflow-hidden rounded-2xl border border-canvas-border bg-canvas-surface">
              {[
                {
                  icon: 'checkmark-circle',
                  color: '#20C997',
                  bg: 'bg-teal-900/40',
                  label: 'Onboarding fee paid',
                  sub: '₦500 · Squad Collections',
                },
                {
                  icon: 'shield-checkmark-outline' as any,
                  color: '#4361EE',
                  bg: 'bg-indigo-900/40',
                  label: 'Identity verification',
                  sub: 'Upload NIN + face match',
                },
                {
                  icon: 'ribbon-outline' as any,
                  color: '#F0A500',
                  bg: 'bg-gold-900/40',
                  label: 'Trust Badge issued',
                  sub: 'Score computed · Badge live',
                },
              ].map(({ icon, color, bg, label, sub }, i) => (
                <View
                  key={label}
                  className={`flex-row items-center justify-between gap-3 px-4 py-3.5 ${i < 2 ? 'border-b border-canvas-border' : ''}`}>
                  <View className={`h-8 w-8 rounded-xl ${bg} items-center justify-center`}>
                    <Ionicons name={icon as any} size={15} color={color} />
                  </View>
                  <View className="">
                    <Text className={`text-sm font-medium ${'text-teal-400'}`}>{label}</Text>
                    <Text className="mt-0.5 text-xs text-canvas-muted">{sub}</Text>
                  </View>
                  <View className="flex-row items-center gap-1.5 rounded-full border border-teal-700/40 bg-teal-900/60 px-2 py-0.5">
                    <View className="h-1.5 w-1.5 rounded-full bg-teal-400" />
                    <Text className="text-xs text-teal-300">Done</Text>
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(520)} className="w-full">
            <TouchableOpacity
              onPress={() => {
                handleContinue();
              }}
              className="mx-auto w-full min-w-36 items-center rounded-2xl bg-indigo-500 py-4 active:bg-indigo-700">
              <Text className="text-sm font-semibold text-white">Continue →</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default function VerifyPaymentScreen() {
  const { reference } = useLocalSearchParams<{ reference: string }>();

  const { isError, isLoading, refetch } = useQuery({
    queryFn: () => verifyOnboardingFeePayment(reference),
    queryKey: ['verify-payment', reference],
    retry: 2,
    retryDelay: 1500,
  });

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState onRetry={refetch} />;
  return <SuccessState />;
}
