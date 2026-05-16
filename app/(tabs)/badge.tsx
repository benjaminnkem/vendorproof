import { showToast } from '@/lib/config/toast';
import useUser from '@/lib/hooks/use-user';
import { MOCK_VENDOR, TIER_CONFIG } from '@/lib/types/dashboard';
import { copyText } from '@/lib/utils/app';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useEffect } from 'react';
import { Dimensions, ScrollView, Share, Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

function OrbitRings({ color }: { color: string }) {
  const rot1 = useSharedValue(0);
  const rot2 = useSharedValue(0);

  useEffect(() => {
    rot1.value = withRepeat(withTiming(360, { duration: 8000, easing: Easing.linear }), -1);
    rot2.value = withRepeat(withTiming(-360, { duration: 12000, easing: Easing.linear }), -1);
  }, []);

  const style1 = useAnimatedStyle(() => ({ transform: [{ rotate: `${rot1.value}deg` }] }));
  const style2 = useAnimatedStyle(() => ({ transform: [{ rotate: `${rot2.value}deg` }] }));

  return (
    <View className="pointer-events-none absolute inset-0 items-center justify-center">
      <Animated.View
        style={[style1, { borderColor: color + '20', borderWidth: 1, borderStyle: 'dashed' }]}
        className="absolute h-72 w-72 rounded-full"
      />
      <Animated.View
        style={[style2, { borderColor: color + '12', borderWidth: 0.5 }]}
        className="absolute h-56 w-56 rounded-full"
      />
    </View>
  );
}

function BadgeMedallion() {
  const scaleVal = useSharedValue(0.8);
  const glowVal = useSharedValue(0);

  const { user } = useUser();
  const business = user?.business;
  const tc = TIER_CONFIG[business?.tier?.name.toLowerCase() as keyof typeof TIER_CONFIG];

  useEffect(() => {
    scaleVal.value = withSpring(1, { damping: 12, stiffness: 120 });
    glowVal.value = withRepeat(
      withSequence(withTiming(1, { duration: 2000 }), withTiming(0.3, { duration: 2000 })),
      -1
    );
  }, []);

  const scaleStyle = useAnimatedStyle(() => ({ transform: [{ scale: scaleVal.value }] }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glowVal.value }));

  return (
    <View className="my-8 items-center justify-center" style={{ height: 280 }}>
      <OrbitRings color={tc.color} />

      <Animated.View
        style={[glowStyle, { backgroundColor: tc.color + '15' }]}
        className="absolute h-52 w-52 rounded-full"
      />

      <Animated.View
        style={[scaleStyle, { borderColor: tc.color, borderWidth: 2 }]}
        className="h-44 w-44 items-center justify-center rounded-full">
        <View
          className="h-36 w-36 items-center justify-center rounded-full border border-canvas-border bg-canvas-surface"
          style={{ backgroundColor: tc.bg }}>
          <MaterialCommunityIcons name="shield-check" size={32} color={tc.color} />
          <Text className="mt-1 text-3xl font-light text-white">{business?.trustScore}</Text>
          <Text className="mt-0.5 text-xs font-medium capitalize" style={{ color: tc.color }}>
            {business?.tier?.name.toLowerCase()}
          </Text>
        </View>

        {[0, 90, 180, 270].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const r = 72;
          return (
            <View
              key={i}
              className="absolute h-2 w-2 rounded-full"
              style={{
                backgroundColor: tc.color,
                opacity: 0.6,
                transform: [{ translateX: Math.cos(rad) * r }, { translateY: Math.sin(rad) * r }],
              }}
            />
          );
        })}
      </Animated.View>
    </View>
  );
}

function VerificationChecks() {
  const checks = [
    { label: 'Identity document', detail: 'NIN verified', done: true },
    { label: 'Biometric match', detail: '94% confidence', done: true },
    { label: 'Behavioral score', detail: '76 / 100', done: true },
    { label: 'Squad payment link', detail: 'Active', done: true },
  ];

  return (
    <Animated.View entering={FadeInDown.delay(200)} className="mb-4">
      <View className="overflow-hidden rounded-3xl border border-canvas-border bg-canvas-surface">
        {checks.map(({ label, detail, done }, i) => (
          <View
            key={label}
            className={`flex-row items-center gap-3 px-4 py-3.5 ${i < checks.length - 1 ? 'border-b border-canvas-border' : ''}`}>
            <View
              className={`h-6 w-6 items-center justify-center rounded-full ${done ? 'border border-teal-700 bg-teal-900' : 'border border-canvas-border bg-canvas-elevated'}`}>
              {done && <Text className="text-xs text-teal-400">✓</Text>}
            </View>
            <Text className="flex-1 text-sm text-white">{label}</Text>
            <Text className="text-xs text-canvas-muted">{detail}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

function QRCard() {
  const v = MOCK_VENDOR;

  const { user } = useUser();
  const business = user?.business;

  const qrLink = `${process.env.EXPO_PUBLIC_FRONTEND_URL}${business?.paymentLink}`;

  return (
    <Animated.View entering={FadeInDown.delay(300)} className="mb-4">
      <View className="rounded-3xl border border-canvas-border bg-canvas-surface p-5">
        <Text className="mb-4 text-xs uppercase tracking-widest text-canvas-muted">
          Scan to pay & verify
        </Text>

        <View className="items-center">
          {/* QR wrapper */}
          <View className="mb-4 rounded-2xl bg-white p-4">
            <QRCode value={qrLink} size={width * 0.48} color="#080B12" backgroundColor="white" />
          </View>

          <Text className="mb-1 text-sm font-medium text-white">{v.businessName}</Text>
          <Text className="text-center text-xs text-canvas-muted" numberOfLines={1}>
            {qrLink}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

function ShareActions() {
  const { user } = useUser();
  const business = user?.business;
  const tc = TIER_CONFIG[business?.tier?.name.toLowerCase() as keyof typeof TIER_CONFIG];
  const qrLink = `${process.env.EXPO_PUBLIC_FRONTEND_URL}${business?.paymentLink}`;

  const handleShare = async () => {
    await Share.share({
      message: `I'm a verified vendor on VendorProof!\n\nTrust Score: ${business?.trustScore}/100 · ${tc.label} Tier\n\nPay me securely: ${qrLink}`,
      title: `${business?.name} — VendorProof Badge`,
    });
  };

  const copyLink = async () => {
    await copyText(qrLink);
    showToast.success('Link copied to clipboard');
  };

  const actions = [
    {
      icon: <Ionicons name="share-social-outline" size={20} color="#4361EE" />,
      label: 'Share badge',
      bg: 'bg-indigo-900/60',
      border: 'border-indigo-500/40',
      onPress: handleShare,
    },
    {
      icon: <Ionicons name="copy-outline" size={20} color="#20C997" />,
      label: 'Copy link',
      bg: 'bg-teal-900/60',
      border: 'border-teal-700/40',
      onPress: copyLink,
    },
    {
      icon: <Feather name="download" size={20} color="#F0A500" />,
      label: 'Save QR',
      bg: 'bg-gold-900/60',
      border: 'border-gold-700/40',
      onPress: async () => {
        const qrLink = `${process.env.EXPO_PUBLIC_FRONTEND_URL}${business?.paymentLink}`;
        showToast.success('QR code saved to clipboard');
      },
    },
  ];

  return (
    <Animated.View entering={FadeInDown.delay(400)} className="mb-4 flex-row gap-3">
      {actions.map(({ icon, label, bg, border, onPress }) => (
        <TouchableOpacity
          key={label}
          onPress={onPress}
          className={`flex-1 ${bg} border ${border} items-center gap-2 rounded-2xl py-3.5`}>
          {icon}
          <Text className="text-xs font-medium text-white">{label}</Text>
        </TouchableOpacity>
      ))}
    </Animated.View>
  );
}

function PaymentLinkCard() {
  const v = MOCK_VENDOR;
  const { user } = useUser();
  const business = user?.business;
  const qrLink = `${process.env.EXPO_PUBLIC_FRONTEND_URL}${business?.paymentLink}`;

  return (
    <Animated.View entering={FadeInDown.delay(480)} className="mb-5">
      <View className="rounded-3xl border border-canvas-border bg-canvas-surface p-4">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-900">
            <Ionicons name="link-outline" size={18} color="#7B8FF7" />
          </View>
          <View className="flex-1">
            <Text className="mb-0.5 text-sm font-semibold text-white">Squad payment link</Text>
            <Text className="text-xs text-canvas-muted" numberOfLines={1}>
              {qrLink}
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5 rounded-full border border-teal-700/40 bg-teal-900/60 px-2.5 py-1">
            <View className="h-1.5 w-1.5 rounded-full bg-teal-400" />
            <Text className="text-xs text-teal-400">Active</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

export default function BadgeScreen() {
  const { user } = useUser();
  const business = user?.business;
  const tc = TIER_CONFIG[business?.tier?.name.toLowerCase() as keyof typeof TIER_CONFIG];

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(0)} className="mb-2 pt-4">
          <Text className="mb-1 text-xs uppercase tracking-widest text-canvas-muted">
            Your trust badge
          </Text>
          <Text className="text-2xl font-semibold text-white">{business?.name}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60)}>
          <BadgeMedallion />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120)} className="mb-4">
          <View className="rounded-3xl border border-canvas-border bg-canvas-surface p-4">
            <View className="mb-3 flex-row items-center gap-3 border-b border-canvas-border pb-3">
              <View className="h-10 w-10 items-center justify-center rounded-full border-2 border-indigo-500 bg-indigo-900">
                <Text className="text-base font-semibold text-indigo-200">
                  {business?.name.charAt(0)}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-white">{business?.name}</Text>
                <Text className="text-xs text-canvas-muted">
                  {business?.category} · {user?.phoneNumber}
                </Text>
              </View>
              <View
                className="rounded-full border px-2.5 py-1"
                style={{ backgroundColor: tc.bg, borderColor: tc.color + '50' }}>
                <Text className="text-xs font-semibold" style={{ color: tc.color }}>
                  {tc.label}
                </Text>
              </View>
            </View>

            <View className="flex-row">
              {[
                { label: 'Trust score', value: `${business?.trustScore}/100` },
                { label: 'Transactions', value: `${0}` },
                { label: 'Member since', value: format(business?.createdAt!, 'MMMM yyyy') },
              ].map(({ label, value }, i) => (
                <View
                  key={label}
                  className={`flex-1 ${i > 0 ? 'border-l border-canvas-border pl-3' : 'pr-3'}`}>
                  <Text className="mb-1 text-xs text-canvas-muted">{label}</Text>
                  <Text className="text-sm font-semibold text-white">{value}</Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>

        <VerificationChecks />
        <QRCard />
        <ShareActions />
        <PaymentLinkCard />
      </ScrollView>
    </SafeAreaView>
  );
}
