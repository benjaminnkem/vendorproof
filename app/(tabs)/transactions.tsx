import { getTransactions, Transaction } from '@/lib/services/business-api';
import {
  formatDate,
  formatNaira,
  MOCK_TRANSACTIONS,
  MOCK_WEEKLY_EARNINGS,
} from '@/lib/types/dashboard';
import { Ionicons } from '@expo/vector-icons';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const CHART_W = width - 40;

type Filter = 'all' | 'completed' | 'pending' | 'failed';

const STATUS_META = {
  completed: {
    color: '#20C997',
    bg: '#0a1a14',
    border: '#0B7A52',
    icon: 'checkmark-circle' as const,
  },
  pending: { color: '#F0A500', bg: '#1a1205', border: '#8A5E0A', icon: 'time-outline' as const },
  failed: {
    color: '#E63946',
    bg: '#1a0a08',
    border: '#8A2E1A',
    icon: 'close-circle-outline' as const,
  },
};

function SummaryStrip() {
  const success = MOCK_TRANSACTIONS.filter((t) => t.status === 'success');
  const total = success.reduce((s, t) => s + t.amount, 0);

  return (
    <Animated.View entering={FadeInDown.delay(80)} className="mb-4">
      <View className="rounded-3xl border border-canvas-border bg-canvas-surface p-4">
        <Text className="mb-3 text-xs uppercase tracking-widest text-canvas-muted">
          This period
        </Text>
        <View className="flex-row gap-0">
          {[
            { label: 'Volume', value: formatNaira(total), color: '#fff' },
            { label: 'Completed', value: `${success.length}`, color: '#20C997' },
            {
              label: 'Pending',
              value: `${MOCK_TRANSACTIONS.filter((t) => t.status === 'pending').length}`,
              color: '#F0A500',
            },
            {
              label: 'Failed',
              value: `${MOCK_TRANSACTIONS.filter((t) => t.status === 'failed').length}`,
              color: '#E63946',
            },
          ].map(({ label, value, color }, i) => (
            <View
              key={label}
              className={`flex-1 ${i > 0 ? 'border-l border-canvas-border pl-3' : 'pr-3'}`}>
              <Text className="mb-1 text-xs text-canvas-muted">{label}</Text>
              <Text className="text-sm font-semibold" style={{ color }}>
                {value}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

function ActivityChart() {
  return (
    <Animated.View entering={FadeInDown.delay(140)} className="mb-5">
      <Text className="mb-3 text-sm font-semibold text-white">Daily volume</Text>
      <View className="overflow-hidden rounded-3xl border border-canvas-border bg-canvas-surface pb-1 pt-3">
        <BarChart
          data={{
            labels: MOCK_WEEKLY_EARNINGS.map((d) => d.day),
            datasets: [{ data: MOCK_WEEKLY_EARNINGS.map((d) => d.amount / 1000) }],
          }}
          width={CHART_W - 20}
          height={140}
          yAxisLabel=""
          yAxisSuffix="k"
          chartConfig={{
            backgroundGradientFrom: '#0D1120',
            backgroundGradientTo: '#0D1120',
            decimalPlaces: 0,
            color: (o = 1) => `rgba(32,201,151,${o})`,
            labelColor: () => '#8892A4',
            barPercentage: 0.5,
            fillShadowGradient: '#20C997',
            fillShadowGradientOpacity: 1,
            propsForBackgroundLines: { stroke: '#1E2535', strokeWidth: 0.5 },
          }}
          style={{ marginLeft: -24 }}
          showBarTops={false}
          fromZero
          withInnerLines
        />
      </View>
    </Animated.View>
  );
}

function FilterPills({ active, onChange }: { active: Filter; onChange: (f: Filter) => void }) {
  const filters: { id: Filter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'completed', label: 'Completed' },
    { id: 'pending', label: 'Pending' },
    { id: 'failed', label: 'Failed' },
  ];

  return (
    <Animated.View entering={FadeInDown.delay(200)} className="mb-4 flex-row gap-2">
      {filters.map(({ id, label }) => {
        const isActive = active === id;
        const meta = id !== 'all' ? STATUS_META[id as Exclude<Filter, 'all'>] : null;
        return (
          <TouchableOpacity
            key={id}
            onPress={() => onChange(id)}
            className={`flex-row items-center gap-1.5 rounded-full border px-3 py-2 ${
              isActive
                ? 'border-indigo-500 bg-indigo-900'
                : 'border-canvas-border bg-canvas-surface'
            }`}>
            {meta && isActive && (
              <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
            )}
            <Text
              className={`text-xs font-medium ${isActive ? 'text-indigo-200' : 'text-canvas-muted'}`}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </Animated.View>
  );
}

function TxnRow({ txn, index }: { txn: Transaction; index: number }) {
  const meta = STATUS_META[txn.status.toLowerCase() as Exclude<Filter, 'all'>];

  return (
    <Animated.View entering={FadeInRight.delay(index * 40).springify()}>
      <View className="mb-2.5 flex-row items-center rounded-2xl border border-canvas-border bg-canvas-surface px-4 py-3.5">
        {/* Status icon */}
        <View
          className="mr-3 h-10 w-10 items-center justify-center rounded-full border"
          style={{ backgroundColor: meta.bg, borderColor: meta.border }}>
          <Ionicons name={meta.icon} size={18} color={meta.color} />
        </View>

        <View className="flex-1">
          <Text className="mb-0.5 text-sm font-medium text-white">{txn.buyerName}</Text>
          <View className="flex-row items-center gap-1.5">
            <Text className="text-xs text-canvas-muted">{txn.amount}</Text>
            <Text className="text-xs text-canvas-muted">·</Text>
            <Text className="text-xs text-canvas-muted">{formatDate(txn.createdAt)}</Text>
          </View>
        </View>

        <View className="items-end gap-1">
          <Text className="text-sm font-bold text-white">+{formatNaira(txn.amount)}</Text>
          <Text className="text-xs font-medium capitalize" style={{ color: meta.color }}>
            {txn.status}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

export default function TransactionsScreen() {
  const [filter, setFilter] = useState<Filter>('all');

  const { data, isLoading } = useInfiniteQuery({
    queryKey: ['transactions', filter],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getTransactions({
        page: pageParam,
        limit: 10,
        ...(filter !== 'all' && { status: filter.toUpperCase() }),
      }),
    getNextPageParam: (lastPage) => {
      if (lastPage?.meta?.hasNextPage) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
  });

  const transactions = data?.pages.flatMap((page) => page.data) || [];

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(0)} className="mb-5 pt-4">
          <Text className="mb-1 text-xs uppercase tracking-widest text-canvas-muted">
            Payment history
          </Text>
          <Text className="text-2xl font-semibold text-white">Activity</Text>
        </Animated.View>

        <SummaryStrip />
        <ActivityChart />
        <FilterPills active={filter} onChange={setFilter} />

        <Animated.View entering={FadeInDown.delay(240)}>
          <Text className="mb-3 text-sm font-semibold text-white">
            {transactions.length} transactions
          </Text>
          {isLoading ? (
            <ActivityIndicator size="large" color="#20C997" />
          ) : (
            transactions.map((txn, i) => <TxnRow key={txn.id} txn={txn} index={i} />)
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
