import useUser from '@/lib/hooks/use-user';
import { MOCK_VENDOR, TIER_CONFIG, formatNaira } from '@/lib/types/dashboard';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

function ProfileAvatar() {
  const v = MOCK_VENDOR;
  const tc = TIER_CONFIG[v.tier];
  const pulse = useSharedValue(1);
  const { user } = useUser();

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1.06, { duration: 1800 }), withTiming(1, { duration: 1800 })),
      -1
    );
  }, []);

  const ringStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  return (
    <View className="items-center pb-4 pt-6">
      <Animated.View
        style={[ringStyle, { borderColor: tc.color + '30', borderWidth: 1.5, borderRadius: 60 }]}
        className="mb-3 h-28 w-28 items-center justify-center rounded-full">
        <View
          className="h-24 w-24 items-center justify-center rounded-full border-2"
          style={{ backgroundColor: tc.bg, borderColor: tc.color }}>
          <Text style={{ fontSize: 40 }}>👤</Text>
        </View>
      </Animated.View>

      <Text className="mb-1 text-xl font-semibold text-white">
        {user?.firstName} {user?.lastName}
      </Text>
      <Text className="mb-3 text-sm text-canvas-muted">{user?.phoneNumber}</Text>

      <View
        className="flex-row items-center gap-2 rounded-full border px-4 py-1.5"
        style={{ backgroundColor: tc.bg, borderColor: tc.color + '50' }}>
        <MaterialCommunityIcons name="shield-check" size={14} color={tc.color} />
        <Text className="text-sm font-semibold" style={{ color: tc.color }}>
          {tc.label} Vendor · Verified
        </Text>
      </View>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
  last = false,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  last?: boolean;
}) {
  return (
    <View
      className={`flex-row items-center gap-3 px-4 py-3.5 ${!last ? 'border-b border-canvas-border' : ''}`}>
      <View className="h-8 w-8 items-center justify-center rounded-xl bg-canvas-elevated">
        {icon}
      </View>
      <View className="flex-1">
        <Text className="mb-0.5 text-xs text-canvas-muted">{label}</Text>
        <Text className="text-sm font-medium capitalize text-white">{value}</Text>
      </View>
    </View>
  );
}

function ScoreBreakdown() {
  const v = MOCK_VENDOR;
  const tc = TIER_CONFIG[v.tier];

  const layers = [
    {
      label: 'Document intelligence',
      value: v.documentScore,
      color: '#4361EE',
      desc: 'NIN · Format · Anomaly scan',
    },
    {
      label: 'Biometric match',
      value: v.biometricScore,
      color: '#20C997',
      desc: 'Face similarity · Liveness',
    },
    {
      label: 'Behavioral baseline',
      value: v.behavioralScore,
      color: tc.color,
      desc: 'Transaction consistency',
    },
  ];

  const { user } = useUser();

  return (
    <Animated.View entering={FadeInDown.delay(220)} className="mb-4">
      <Text className="mb-3 text-sm font-semibold text-white">Score breakdown</Text>
      <View className="overflow-hidden rounded-3xl border border-canvas-border bg-canvas-surface">
        <View className="border-b border-canvas-border px-4 pb-3 pt-4">
          <View className="mb-3 flex-row items-end gap-2">
            <Text className="font-light text-white" style={{ fontSize: 56, lineHeight: 60 }}>
              {user?.business.trustScore || '-'}
            </Text>
            <View className="pb-3">
              <Text className="text-base text-canvas-muted">/ 100</Text>
              <View
                className="mt-1 rounded-full border px-2 py-0.5"
                style={{ backgroundColor: tc.bg, borderColor: tc.color + '50' }}>
                <Text className="text-xs font-semibold" style={{ color: tc.color }}>
                  {tc.label}
                </Text>
              </View>
            </View>
          </View>
          <View className="h-1.5 overflow-hidden rounded-full bg-canvas-border">
            <View
              className="h-full rounded-full"
              style={{ width: `${v.trustScore}%`, backgroundColor: tc.color }}
            />
          </View>
        </View>

        {layers.map(({ label, value, color, desc }, i) => (
          <View
            key={label}
            className={`px-4 py-3.5 ${i < layers.length - 1 ? 'border-b border-canvas-border' : ''}`}>
            <View className="mb-2 flex-row items-center justify-between">
              <View>
                <Text className="text-sm font-medium text-white">{label}</Text>
                <Text className="mt-0.5 text-xs text-canvas-muted">{desc}</Text>
              </View>
              <Text className="text-sm font-bold" style={{ color }}>
                {value}
              </Text>
            </View>
            <View className="h-1 overflow-hidden rounded-full bg-canvas-border">
              <Animated.View
                entering={FadeInRight.delay(300 + i * 80)}
                className="h-full rounded-full"
                style={{ width: `${value}%`, backgroundColor: color }}
              />
            </View>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

function ProfileStats() {
  const v = MOCK_VENDOR;
  const stats = [
    { label: 'Total earned', value: formatNaira(v.totalEarnings), color: '#20C997' },
    { label: 'Total orders', value: `${v.totalTransactions}`, color: '#4361EE' },
    { label: 'Avg order value', value: formatNaira(v.avgOrderValue), color: '#F0A500' },
    { label: 'Dispute rate', value: `${v.disputeRate}%`, color: '#B4B2A9' },
  ];

  return (
    <Animated.View entering={FadeInDown.delay(160)} className="mb-4">
      <Text className="mb-3 text-sm font-semibold text-white">Performance</Text>
      <View className="flex-row flex-wrap gap-2">
        {stats.map(({ label, value, color }, i) => (
          <Animated.View key={label} entering={FadeInDown.delay(160 + i * 50)} className="w-[48%]">
            <View className="rounded-2xl border border-canvas-border bg-canvas-surface p-4">
              <Text className="mb-2 text-xs text-canvas-muted">{label}</Text>
              <Text className="text-base font-bold" style={{ color }}>
                {value}
              </Text>
            </View>
          </Animated.View>
        ))}
      </View>
    </Animated.View>
  );
}

function BusinessSnippet() {
  const router = useRouter();
  const { user } = useUser();
  const v = MOCK_VENDOR;
  const business = user?.business;

  return (
    <Animated.View entering={FadeInDown.delay(300)} className="mb-4">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-white">Business details</Text>
        <TouchableOpacity
          onPress={() => router.push('/(profile)/edit-business')}
          className="flex-row items-center gap-1 rounded-full bg-canvas-surface px-3 py-1.5 active:bg-canvas-elevated">
          <Ionicons name="create-outline" size={16} color="#8892A4" />
          <Text className="text-xs font-medium text-canvas-muted">Edit</Text>
        </TouchableOpacity>
      </View>

      <View className="overflow-hidden rounded-3xl border border-canvas-border bg-canvas-surface">
        <InfoRow
          icon={<Ionicons name="business-outline" size={15} color="#7B8FF7" />}
          label="Business name"
          value={business?.name}
        />
        <InfoRow
          icon={<MaterialCommunityIcons name="tag-outline" size={15} color="#7B8FF7" />}
          label="Category"
          value={v?.category}
        />
        <InfoRow
          icon={<Ionicons name="call-outline" size={15} color="#7B8FF7" />}
          label="Phone"
          value={user?.phoneNumber}
        />
        <InfoRow
          icon={<Ionicons name="location-outline" size={15} color="#7B8FF7" />}
          label="Category"
          value={business?.category || '-'}
          last
        />

        <TouchableOpacity
          onPress={() => router.push('/(profile)/business')}
          className="flex-row items-center justify-between border-t border-canvas-border px-4 py-4 active:bg-canvas-elevated">
          <View className="flex-row items-center gap-3">
            <View className="h-8 w-8 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-900/60">
              <Ionicons name="storefront-outline" size={15} color="#7B8FF7" />
            </View>
            <View>
              <Text className="text-sm font-medium text-white">Full business profile</Text>
              <Text className="text-xs text-canvas-muted">
                Showcase images, socials, bank details
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#8892A4" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

function UpgradeCTA() {
  const v = MOCK_VENDOR;
  const ptsLeft = 95 - v.trustScore;

  return (
    <Animated.View entering={FadeInDown.delay(380)} className="mb-5">
      <View className="rounded-3xl border border-indigo-500/30 bg-indigo-900/40 p-4">
        <View className="mb-3 flex-row items-center gap-3">
          <View className="h-9 w-9 items-center justify-center rounded-xl border border-teal-700 bg-teal-900">
            <MaterialCommunityIcons name="shield-crown-outline" size={18} color="#20C997" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-white">Platinum is close</Text>
            <Text className="mt-0.5 text-xs text-canvas-muted">
              {ptsLeft} more trust points to unlock
            </Text>
          </View>
        </View>
        <View className="mb-2 h-1.5 overflow-hidden rounded-full bg-canvas-border">
          <View
            className="h-full rounded-full bg-teal-500/60"
            style={{ width: `${(v.trustScore / 95) * 100}%` }}
          />
        </View>
        <TouchableOpacity className="mt-1 items-center rounded-2xl bg-indigo-600 py-3">
          <Text className="text-sm font-semibold text-white">How to improve score →</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

export default function ProfileScreen() {
  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(0)}>
          <ProfileAvatar />
        </Animated.View>

        <ProfileStats />
        <ScoreBreakdown />
        <BusinessSnippet />
        <UpgradeCTA />
      </ScrollView>
    </SafeAreaView>
  );
}
