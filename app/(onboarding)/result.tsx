import { Button, Card, TierBadge } from '@/components/onboarding/shared';
import type { TrustTier } from '@/lib/store/onboarding.store';
import { useOnboardingStore } from '@/lib/store/onboarding.store';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Share, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TIER_COLORS: Record<TrustTier, { ring: string; glow: string; label: string }> = {
  unverified: { ring: '#8892A4', glow: '#8892A420', label: 'Unverified' },
  bronze: { ring: '#F0A500', glow: '#F0A50025', label: 'Bronze' },
  silver: { ring: '#B4B2A9', glow: '#B4B2A920', label: 'Silver' },
  gold: { ring: '#F0A500', glow: '#F0A50030', label: 'Gold' },
  platinum: { ring: '#20C997', glow: '#20C99730', label: 'Platinum' },
};

const TIER_MESSAGES: Record<TrustTier, { headline: string; sub: string }> = {
  unverified: { headline: 'Verification incomplete', sub: 'Please retry the verification flow.' },
  bronze: {
    headline: "You're verified!",
    sub: 'Start building your transaction history to unlock Silver.',
  },
  silver: {
    headline: 'Silver tier unlocked',
    sub: 'Great score. Complete 50 more transactions for Gold.',
  },
  gold: {
    headline: 'Gold tier! Excellent.',
    sub: "You're in the top 20% of verified vendors on VendorProof.",
  },
  platinum: {
    headline: 'Platinum achieved 🎉',
    sub: 'Maximum trust tier. Your payment limits are fully unlocked.',
  },
};

// Animated score ring
function ScoreRing({ score, tier }: { score: number; tier: TrustTier }) {
  const colors = TIER_COLORS[tier];
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.back(1.4)),
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View
      style={{ transform: [{ scale: scaleAnim }] }}
      className="items-center justify-center">
      {/* Glow layer */}
      <Animated.View
        style={{
          opacity: glowAnim,
          position: 'absolute',
          width: 180,
          height: 180,
          borderRadius: 90,
          backgroundColor: colors.glow,
        }}
      />

      {/* Slow rotating ring */}
      <Animated.View
        style={{
          transform: [{ rotate }],
          position: 'absolute',
          width: 170,
          height: 170,
          borderRadius: 85,
          borderWidth: 1,
          borderColor: colors.ring + '40',
          borderStyle: 'dashed',
        }}
      />

      {/* Main ring */}
      <View
        className="h-36 w-36 items-center justify-center rounded-full"
        style={{ borderWidth: 2.5, borderColor: colors.ring }}>
        {/* Inner surface */}
        <View className="h-28 w-28 items-center justify-center rounded-full border border-canvas-border bg-canvas-surface">
          <Text className="font-medium text-white" style={{ fontSize: 40, lineHeight: 44 }}>
            {score}
          </Text>
          <Text className="mt-0.5 text-xs text-canvas-muted">/ 100</Text>
        </View>
      </View>

      {/* Orbit dots */}
      {[45, 135, 225, 315].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <Animated.View
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full"
            style={{
              backgroundColor: colors.ring,
              opacity: 0.5,
              transform: [{ translateX: Math.cos(rad) * 85 }, { translateY: Math.sin(rad) * 85 }],
            }}
          />
        );
      })}
    </Animated.View>
  );
}

// Score breakdown bar
function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: value,
      duration: 1000,
      delay: 400,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, []);

  return (
    <View className="mb-3">
      <View className="mb-1.5 flex-row justify-between">
        <Text className="text-xs text-canvas-muted">{label}</Text>
        <Text className="text-xs font-medium text-white">{value}</Text>
      </View>
      <View className="h-1 overflow-hidden rounded-full bg-canvas-border">
        <Animated.View
          style={{
            height: '100%',
            borderRadius: 4,
            backgroundColor: color,
            width: widthAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
          }}
        />
      </View>
    </View>
  );
}

export default function ResultScreen() {
  const router = useRouter();
  const { data, trustScore } = useOnboardingStore();

  const score = trustScore?.overall ?? 82;
  const tier = trustScore?.tier ?? 'bronze';
  const docScore = trustScore?.documentScore ?? 85;
  const bioScore = trustScore?.biometricScore ?? 88;
  const paymentLink = trustScore?.squadPaymentLink ?? 'https://sandbox-pay.squadco.com/DEMO';

  const colors = TIER_COLORS[tier];
  const message = TIER_MESSAGES[tier];

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, delay: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, delay: 200, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I'm a verified vendor on VendorProof!\n\nTrust Score: ${score}/100 · ${tier.charAt(0).toUpperCase() + tier.slice(1)} Tier\n\nPay me securely: ${paymentLink}`,
        title: `${data.businessName} — VendorProof Badge`,
      });
    } catch (e) {
      console.error('Share failed', e);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <View className="flex-1 px-6">
        {/* Top label */}
        <Animated.View
          style={{ opacity: fadeAnim }}
          className="mb-2 mt-6 flex-row items-center justify-center">
          <View className="flex-row items-center gap-2 rounded-full border border-canvas-border bg-canvas-surface px-4 py-2">
            <View className="h-1.5 w-1.5 rounded-full bg-teal-500" />
            <Text className="text-xs uppercase tracking-widest text-canvas-muted">
              Verification complete
            </Text>
          </View>
        </Animated.View>

        {/* Score ring */}
        <Animated.View style={{ opacity: fadeAnim }} className="my-8 items-center">
          <ScoreRing score={score} tier={tier} />
        </Animated.View>

        {/* Headline */}
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
          className="mb-6 items-center">
          <TierBadge tier={tier} />
          <Text className="mb-1 mt-3 text-center text-2xl font-medium text-white">
            {message.headline}
          </Text>
          <Text className="text-center text-sm leading-relaxed text-canvas-muted">
            {message.sub}
          </Text>
        </Animated.View>

        {/* Score breakdown */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <Card className="mb-4">
            <Text className="mb-4 text-xs uppercase tracking-widest text-canvas-muted">
              Score breakdown
            </Text>
            <ScoreBar label="Document intelligence" value={docScore} color="#4361EE" />
            <ScoreBar label="Biometric match" value={bioScore} color="#20C997" />
            <ScoreBar label="Behavioral baseline" value={72} color={colors.ring} />
          </Card>

          {/* Payment link */}
          <Card className="mb-4 border-canvas-border">
            <View className="flex-row items-center gap-3">
              <View className="h-9 w-9 items-center justify-center rounded-xl bg-indigo-900">
                <Text className="text-sm">🔗</Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-white">Your Squad payment link</Text>
                <Text className="mt-0.5 text-xs text-canvas-muted" numberOfLines={1}>
                  {paymentLink}
                </Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        <View className="flex-1" />

        {/* CTAs */}
        <Animated.View style={{ opacity: fadeAnim }} className="gap-3 pb-6">
          <Button label="Share my Trust Badge →" onPress={handleShare} />
          <Button
            label="Go to dashboard"
            onPress={() => router.replace('/(tabs)')}
            variant="outline"
          />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
