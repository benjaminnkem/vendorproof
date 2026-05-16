import useUser from '@/lib/hooks/use-user';
import { getDashboardAnalytics } from '@/lib/services/analytics-api';
import {
  MOCK_TRANSACTIONS,
  MOCK_VENDOR,
  TIER_CONFIG,
  formatDate,
  formatNaira,
} from '@/lib/types/dashboard';
import { formatNairaCompact } from '@/lib/utils/app';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const CHART_W = width - 40;

function PulseDot({ color }: { color: string }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.8, { duration: 800, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 800 })
      ),
      -1
    );
    opacity.value = withRepeat(
      withSequence(withTiming(0.05, { duration: 800 }), withTiming(0.5, { duration: 800 })),
      -1
    );
  }, []);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View className="h-3 w-3 items-center justify-center">
      <Animated.View
        style={[ringStyle, { backgroundColor: color }]}
        className="absolute h-3 w-3 rounded-full"
      />
      <View className="z-10 h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
    </View>
  );
}

function TrustScoreCard() {
  const v = MOCK_VENDOR;

  const barWidth = useSharedValue(0);
  useEffect(() => {
    barWidth.value = withTiming(v.trustScore / 100, {
      duration: 1400,
      easing: Easing.out(Easing.cubic),
    });
  }, []);

  const { data: analytics, isPending } = useQuery({
    queryFn: getDashboardAnalytics,
    queryKey: ['analytics', 'dashboard'],
  });

  if (isPending)
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#20C997" />
      </View>
    );

  if (!analytics) return null;

  const tc =
    TIER_CONFIG[analytics?.currentTier?.toLocaleLowerCase() as unknown as keyof typeof TIER_CONFIG];

  const bars = [
    { label: 'Document', val: analytics.kycScores.document, color: '#4361EE' },
    { label: 'Biometric', val: analytics.kycScores.biometric, color: '#20C997' },
    { label: 'Behavioral', val: analytics.kycScores.transactionsConsistency, color: tc.color },
  ];

  return (
    <Animated.View entering={FadeInDown.delay(80).springify()} className="mb-4">
      <View className="overflow-hidden rounded-3xl border border-canvas-border bg-canvas-surface p-5">
        <View
          className="absolute -right-10 -top-10 h-44 w-44 rounded-full opacity-10"
          style={{ backgroundColor: tc.color }}
        />

        <View className="flex-row items-start justify-between">
          <View>
            <View className="mb-2 flex-row items-center gap-2">
              <PulseDot color={tc.color} />
              <Text className="text-xs uppercase tracking-widest text-canvas-muted">
                Trust Score
              </Text>
            </View>
            <Text className="font-light text-white" style={{ fontSize: 68, lineHeight: 72 }}>
              {analytics.trustScore}
            </Text>
            <Text className="-mt-1 text-sm text-canvas-muted">/ 100</Text>

            <View
              className="mt-3 flex-row items-center gap-1.5 self-start rounded-full border px-2.5 py-1"
              style={{ backgroundColor: tc.bg, borderColor: tc.color + '50' }}>
              <MaterialCommunityIcons name="shield-check" size={11} color={tc.color} />
              <Text className="text-xs font-semibold" style={{ color: tc.color }}>
                {analytics.currentTier}
              </Text>
            </View>
          </View>

          <View className="w-36 gap-3">
            {bars.map(({ label, val, color }) => (
              <View key={label}>
                <View className="mb-1.5 flex-row justify-between">
                  <Text className="text-xs text-canvas-muted">{label}</Text>
                  <Text className="text-xs font-medium text-white">{val}</Text>
                </View>
                <View className="h-0.5 overflow-hidden rounded-full bg-canvas-border">
                  <View
                    className="h-full rounded-full"
                    style={{ width: `${val}%`, backgroundColor: color }}
                  />
                </View>
              </View>
            ))}

            <View className="mt-1">
              <Text className="mb-1.5 text-xs text-canvas-muted">To Platinum</Text>
              <View className="h-0.5 overflow-hidden rounded-full bg-canvas-border">
                <View
                  className="h-full rounded-full"
                  style={{ width: `${(v.trustScore / 95) * 100}%`, backgroundColor: '#20C99760' }}
                />
              </View>
              <Text className="mt-1 text-xs" style={{ color: '#8892A440' }}>
                {95 - v.trustScore} pts away
              </Text>
            </View>
          </View>
        </View>

        {[
          'absolute top-0 left-0 w-4 h-4 border-t border-l border-indigo-500/30',
          'absolute top-0 right-0 w-4 h-4 border-t border-r border-indigo-500/30',
          'absolute bottom-0 left-0 w-4 h-4 border-b border-l border-indigo-500/30',
          'absolute bottom-0 right-0 w-4 h-4 border-b border-r border-indigo-500/30',
        ].map((cls, i) => (
          <View key={i} className={cls} />
        ))}
      </View>
    </Animated.View>
  );
}

function StatsGrid() {
  const { data: analytics, isPending } = useQuery({
    queryFn: getDashboardAnalytics,
    queryKey: ['analytics', 'dashboard'],
  });

  const stats = [
    {
      label: 'Earned',
      value: formatNairaCompact(analytics?.totalEarnings || 0),
      icon: <Ionicons name="cash-outline" size={15} color="#20C997" />,
      color: '#20C997',
      delay: 160,
    },
    {
      label: 'Orders',
      value: analytics?.totalOrders,
      icon: <Ionicons name="swap-vertical-outline" size={15} color="#4361EE" />,
      color: '#4361EE',
      delay: 220,
    },
    {
      label: 'Avg',
      value: formatNairaCompact(analytics?.averageMonthlyEarnings || 0),
      icon: <Ionicons name="trending-up-outline" size={15} color="#F0A500" />,
      color: '#F0A500',
      delay: 280,
    },
    {
      label: 'Disputes',
      value: analytics?.disputesCount || 0,
      icon: <Feather name="shield" size={15} color="#B4B2A9" />,
      color: '#B4B2A9',
      delay: 340,
    },
  ];

  return (
    <View className="mb-5 flex-row gap-2">
      {stats.map(({ label, value, icon, color, delay }) => (
        <Animated.View entering={FadeInDown.delay(delay)} key={label} className="flex-1">
          <View className="rounded-2xl border border-canvas-border bg-canvas-surface p-3">
            <View className="mb-2">{icon}</View>
            <Text
              className="mb-1 uppercase tracking-wider text-canvas-muted"
              style={{ fontSize: 9 }}>
              {label}
            </Text>
            <Text className="text-sm font-semibold" style={{ color }}>
              {value}
            </Text>
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

function SectionHead({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View className="mb-3 flex-row items-center justify-between">
      <Text className="text-sm font-semibold text-white">{title}</Text>
      {action && (
        <TouchableOpacity onPress={onAction}>
          <Text className="text-xs text-indigo-400">{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function ChartCard({ children }: { children: React.ReactNode }) {
  return (
    <View className="overflow-hidden rounded-3xl border border-canvas-border bg-canvas-surface pb-1 pt-4">
      {children}
    </View>
  );
}

const CHART_CFG_BASE = {
  backgroundGradientFrom: '#0D1120',
  backgroundGradientTo: '#0D1120',
  decimalPlaces: 0,
  labelColor: () => '#8892A4',
  propsForBackgroundLines: { stroke: '#1E2535', strokeWidth: 0.5 },
};

function EarningsChart() {
  const { data: analytics } = useQuery({
    queryFn: getDashboardAnalytics,
    queryKey: ['analytics', 'dashboard'],
  });

  const weeklyEarnings = analytics?.weeklyEarnings || [];

  return (
    <Animated.View entering={FadeInDown.delay(300)} className="mb-5">
      <SectionHead title="Weekly earnings" action="₦ k" />
      <ChartCard>
        <BarChart
          data={{
            labels: weeklyEarnings.map((d) => d.day.slice(0, 3)),
            datasets: [{ data: weeklyEarnings.map((d) => d.earnings / 1000) }],
          }}
          width={CHART_W - 24}
          height={155}
          yAxisLabel=""
          yAxisSuffix="k"
          chartConfig={{
            ...CHART_CFG_BASE,
            color: (o = 1) => `rgba(67,97,238,${o})`,
            fillShadowGradient: '#4361EE',
            fillShadowGradientOpacity: 1,
            barPercentage: 0.52,
          }}
          style={{ marginLeft: -20 }}
          showBarTops={false}
          fromZero
          withInnerLines
        />
      </ChartCard>
    </Animated.View>
  );
}

function ScoreChart() {
  const { data: analytics } = useQuery({
    queryFn: getDashboardAnalytics,
    queryKey: ['analytics', 'dashboard'],
  });

  const scoreTrajectory = analytics?.scoreTrajectory || [];

  const allMonths = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const getScoreForMonth = (month: string) => {
    const found = scoreTrajectory.find((s) => s.month.slice(0, 3) === month);
    return found ? found.score : 0;
  };

  const months = allMonths.map((d) => d.slice(0, 3));
  const scores = allMonths.map(getScoreForMonth);

  return (
    <Animated.View entering={FadeInDown.delay(380)} className="mb-5">
      <SectionHead title="Score trajectory" />
      <ChartCard>
        <LineChart
          data={{
            labels: months,
            datasets: [{ data: scores }],
          }}
          width={CHART_W - 16}
          height={155}
          chartConfig={{
            ...CHART_CFG_BASE,
            color: (o = 1) => `rgba(32,201,151,${o})`,
            propsForDots: { r: '4', strokeWidth: '2', stroke: '#20C997' },
          }}
          bezier
          style={{ marginLeft: -12 }}
          withInnerLines
          withShadow={false}
        />
      </ChartCard>
    </Animated.View>
  );
}

function RecentTxns({ onSeeAll }: { onSeeAll: () => void }) {
  const STATUS_COLOR = { completed: '#20C997', pending: '#F0A500', failed: '#E63946' } as const;
  const recent = MOCK_TRANSACTIONS.slice(0, 4);

  const { data: analytics, isPending } = useQuery({
    queryFn: getDashboardAnalytics,
    queryKey: ['analytics', 'dashboard'],
  });

  const recentOrders = analytics?.recentOrders || [];

  return (
    <Animated.View entering={FadeInDown.delay(460)} className="mb-5">
      <SectionHead title="Recent activity" action="See all" onAction={onSeeAll} />
      <View className="overflow-hidden rounded-3xl border border-canvas-border bg-canvas-surface">
        {recentOrders?.map((txn, i) => {
          const color = STATUS_COLOR[txn.status?.toLowerCase() as keyof typeof STATUS_COLOR];
          return (
            <View
              key={txn.date}
              className={`flex-row items-center px-4 py-3.5 ${i < recentOrders.length - 1 ? 'border-b border-canvas-border' : ''}`}>
              <View className="mr-3 h-9 w-9 items-center justify-center rounded-full border border-indigo-500/20 bg-indigo-900">
                <Text className="text-sm font-semibold text-indigo-300">
                  {txn.buyerName.charAt(0)}
                </Text>
              </View>

              <View className="flex-1">
                <Text className="mb-0.5 text-sm font-medium text-white">{txn.buyerName}</Text>
                <Text className="text-xs text-canvas-muted">{formatDate(txn.date)}</Text>
              </View>

              <View className="items-end gap-1">
                <Text className="text-sm font-semibold text-white">+{formatNaira(txn.amount)}</Text>
                <View className="rounded-lg px-2 py-0.5" style={{ backgroundColor: color + '18' }}>
                  <Text className="text-xs font-medium capitalize" style={{ color }}>
                    {txn.status}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const router = useRouter();

  const { user } = useUser();

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}>
        <Animated.View
          entering={FadeInDown.delay(0)}
          className="mb-5 flex-row items-center justify-between pt-4">
          <View>
            <Text className="mb-0.5 text-xs text-canvas-muted">Good morning 👋</Text>
            <Text className="text-xl font-semibold text-white">{user?.firstName}</Text>
          </View>

          <View className="flex-row items-center gap-2.5">
            <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full border border-canvas-border bg-canvas-surface">
              <Ionicons name="notifications-outline" size={18} color="#8892A4" />
              <View className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-canvas bg-indigo-500" />
            </TouchableOpacity>

            <View className="h-10 w-10 items-center justify-center rounded-full border-2 border-indigo-500 bg-indigo-900">
              <Text className="text-base font-semibold text-indigo-200">
                {user?.firstName.charAt(0)}
              </Text>
            </View>
          </View>
        </Animated.View>

        <TrustScoreCard />
        <StatsGrid />
        <EarningsChart />
        <ScoreChart />
        <RecentTxns onSeeAll={() => router.push('/(tabs)/transactions')} />
      </ScrollView>
    </SafeAreaView>
  );
}
