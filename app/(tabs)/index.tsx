import { ScanCorners, SectionHead } from '@/components/dashboard/shared';
import {
  formatDate,
  formatNaira,
  MOCK_SCORE_HISTORY,
  MOCK_TRANSACTIONS,
  MOCK_VENDOR,
  MOCK_WEEKLY_EARNINGS,
  TIER_CONFIG,
} from '@/lib/types/dashboard';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';
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
const CHART_WIDTH = width - 40;

function PulseDot({ color = '#20C997' }: { color?: string }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.6, { duration: 900, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 900 })
      ),
      -1
    );
    opacity.value = withRepeat(
      withSequence(withTiming(0.1, { duration: 900 }), withTiming(0.6, { duration: 900 })),
      -1
    );
  }, []);

  const outerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: color,
    position: 'absolute',
  }));

  return (
    <View style={{ width: 12, height: 12, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={outerStyle} />
      <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: color, zIndex: 1 }} />
    </View>
  );
}

function TrustScoreCard() {
  const vendor = MOCK_VENDOR;
  const tierConf = TIER_CONFIG[vendor.tier];
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(vendor.trustScore / 100, {
      duration: 1400,
      easing: Easing.out(Easing.cubic),
    });
  }, []);

  return (
    <Animated.View entering={FadeInDown.delay(100).duration(500).springify()}>
      <View
        style={{
          backgroundColor: '#0D1120',
          borderWidth: 1,
          borderColor: '#1E2535',
          borderRadius: 20,
          padding: 20,
          marginBottom: 16,
          overflow: 'hidden',
        }}>
        <View
          style={{
            position: 'absolute',
            top: -40,
            right: -40,
            width: 180,
            height: 180,
            borderRadius: 90,
            backgroundColor: tierConf.color + '18',
          }}
        />

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <PulseDot color={tierConf.color} />
              <Text
                style={{
                  color: '#8892A4',
                  fontSize: 11,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                }}>
                Trust Score
              </Text>
            </View>
            <Text style={{ color: '#fff', fontSize: 64, fontWeight: '300', lineHeight: 68 }}>
              {vendor.trustScore}
            </Text>
            <Text style={{ color: '#8892A4', fontSize: 13, marginTop: 2 }}>/ 100</Text>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                marginTop: 12,
                backgroundColor: tierConf.bg,
                borderWidth: 1,
                borderColor: tierConf.color + '50',
                borderRadius: 20,
                paddingHorizontal: 10,
                paddingVertical: 4,
                alignSelf: 'flex-start',
              }}>
              <MaterialCommunityIcons name="shield-check" size={12} color={tierConf.color} />
              <Text style={{ color: tierConf.color, fontSize: 11, fontWeight: '600' }}>
                {tierConf.label} Tier
              </Text>
            </View>
          </View>

          {/* Right — score bars */}
          <View style={{ gap: 10, minWidth: 130 }}>
            {[
              { label: 'Document', value: vendor.documentScore, color: '#4361EE' },
              { label: 'Biometric', value: vendor.biometricScore, color: '#20C997' },
              { label: 'Behavioral', value: vendor.behavioralScore, color: tierConf.color },
            ].map(({ label, value, color }) => (
              <View key={label}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: 5,
                  }}>
                  <Text style={{ color: '#8892A4', fontSize: 11 }}>{label}</Text>
                  <Text style={{ color: '#fff', fontSize: 11, fontWeight: '500' }}>{value}</Text>
                </View>
                <View
                  style={{
                    height: 3,
                    backgroundColor: '#1E2535',
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}>
                  <Animated.View
                    style={{
                      height: '100%',
                      width: `${value}%`,
                      backgroundColor: color,
                      borderRadius: 4,
                    }}
                  />
                </View>
              </View>
            ))}

            <View style={{ marginTop: 4 }}>
              <Text style={{ color: '#8892A4', fontSize: 11, marginBottom: 3 }}>To Platinum</Text>
              <View
                style={{
                  height: 3,
                  backgroundColor: '#1E2535',
                  borderRadius: 4,
                  overflow: 'hidden',
                }}>
                <View
                  style={{
                    height: '100%',
                    width: `${(vendor.trustScore / 95) * 100}%`,
                    backgroundColor: '#20C99770',
                    borderRadius: 4,
                  }}
                />
              </View>
              <Text style={{ color: '#8892A450', fontSize: 10, marginTop: 3 }}>
                {95 - vendor.trustScore} pts away
              </Text>
            </View>
          </View>
        </View>

        <ScanCorners color={tierConf.color + '60'} size={14} />
      </View>
    </Animated.View>
  );
}

function StatsRow() {
  const stats = [
    {
      label: 'Total earned',
      value: formatNaira(MOCK_VENDOR.totalEarnings),
      icon: <Ionicons name="cash-outline" size={16} color="#20C997" />,
      color: '#20C997',
      delay: 150,
    },
    {
      label: 'Transactions',
      value: MOCK_VENDOR.totalTransactions.toString(),
      icon: <Ionicons name="swap-vertical-outline" size={16} color="#4361EE" />,
      color: '#4361EE',
      delay: 220,
    },
    {
      label: 'Avg order',
      value: formatNaira(MOCK_VENDOR.avgOrderValue),
      icon: <Ionicons name="trending-up-outline" size={16} color="#F0A500" />,
      color: '#F0A500',
      delay: 290,
    },
    {
      label: 'Dispute rate',
      value: `${MOCK_VENDOR.disputeRate}%`,
      icon: <Feather name="shield" size={16} color="#B4B2A9" />,
      color: '#B4B2A9',
      delay: 360,
    },
  ];

  return (
    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
      {stats.map(({ label, value, icon, color, delay }) => (
        <Animated.View
          key={label}
          entering={FadeInDown.delay(delay).duration(400)}
          style={{ flex: 1 }}>
          <View
            style={{
              backgroundColor: '#0D1120',
              borderWidth: 1,
              borderColor: '#1E2535',
              borderRadius: 14,
              padding: 12,
            }}>
            <View style={{ marginBottom: 8 }}>{icon}</View>
            <Text
              style={{
                color: '#8892A4',
                fontSize: 9,
                textTransform: 'uppercase',
                letterSpacing: 0.8,
                marginBottom: 4,
              }}>
              {label}
            </Text>
            <Text style={{ color, fontSize: 13, fontWeight: '600', lineHeight: 16 }}>{value}</Text>
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

function EarningsChart() {
  return (
    <Animated.View entering={FadeInDown.delay(300).duration(500)} style={{ marginBottom: 20 }}>
      <SectionHead title="Weekly earnings" action="This week" />
      <View
        style={{
          backgroundColor: '#0D1120',
          borderWidth: 1,
          borderColor: '#1E2535',
          borderRadius: 20,
          paddingTop: 16,
          paddingBottom: 4,
          overflow: 'hidden',
        }}>
        <BarChart
          data={{
            labels: MOCK_WEEKLY_EARNINGS.map((d) => d.day),
            datasets: [{ data: MOCK_WEEKLY_EARNINGS.map((d) => d.amount / 1000) }],
          }}
          width={CHART_WIDTH - 32}
          height={160}
          yAxisLabel="₦"
          yAxisSuffix="k"
          chartConfig={{
            backgroundGradientFrom: '#0D1120',
            backgroundGradientTo: '#0D1120',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(67, 97, 238, ${opacity})`,
            labelColor: () => '#8892A4',
            style: { borderRadius: 16 },
            barPercentage: 0.55,
            fillShadowGradient: '#4361EE',
            fillShadowGradientOpacity: 1,
            propsForBackgroundLines: { stroke: '#1E2535', strokeWidth: 0.5 },
          }}
          style={{ marginLeft: -16 }}
          showBarTops={false}
          fromZero
          withInnerLines
        />
      </View>
    </Animated.View>
  );
}

function ScoreHistoryChart() {
  return (
    <Animated.View entering={FadeInDown.delay(400).duration(500)} style={{ marginBottom: 20 }}>
      <SectionHead title="Score history" action="6 months" />
      <View
        style={{
          backgroundColor: '#0D1120',
          borderWidth: 1,
          borderColor: '#1E2535',
          borderRadius: 20,
          paddingTop: 16,
          paddingBottom: 4,
          overflow: 'hidden',
        }}>
        <LineChart
          data={{
            labels: MOCK_SCORE_HISTORY.map((d) => d.date),
            datasets: [{ data: MOCK_SCORE_HISTORY.map((d) => d.score) }],
          }}
          width={CHART_WIDTH - 24}
          height={160}
          chartConfig={{
            backgroundGradientFrom: '#0D1120',
            backgroundGradientTo: '#0D1120',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(32, 201, 151, ${opacity})`,
            labelColor: () => '#8892A4',
            propsForDots: { r: '4', strokeWidth: '2', stroke: '#20C997' },
            propsForBackgroundLines: { stroke: '#1E2535', strokeWidth: 0.5 },
          }}
          bezier
          style={{ marginLeft: -8 }}
          withInnerLines
          withShadow={false}
        />
      </View>
    </Animated.View>
  );
}

function RecentTransactions({ onSeeAll }: { onSeeAll: () => void }) {
  const recent = MOCK_TRANSACTIONS.slice(0, 4);

  return (
    <Animated.View entering={FadeInDown.delay(500).duration(500)} style={{ marginBottom: 20 }}>
      <SectionHead title="Recent activity" action="See all" onAction={onSeeAll} />
      <View
        style={{
          backgroundColor: '#0D1120',
          borderWidth: 1,
          borderColor: '#1E2535',
          borderRadius: 20,
          overflow: 'hidden',
        }}>
        {recent.map((txn, i) => {
          const statusColors = {
            success: '#20C997',
            pending: '#F0A500',
            failed: '#E63946',
          };
          const color = statusColors[txn.status];

          return (
            <View
              key={txn.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderBottomWidth: i < recent.length - 1 ? 1 : 0,
                borderBottomColor: '#1E2535',
              }}>
              {/* Avatar initial */}
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: '#1a1f3a',
                  borderWidth: 1,
                  borderColor: '#2D3FCC30',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}>
                <Text style={{ color: '#7B8FF7', fontSize: 14, fontWeight: '500' }}>
                  {txn.buyerName.charAt(0)}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{ color: '#fff', fontSize: 13, fontWeight: '500', marginBottom: 2 }}>
                  {txn.buyerName}
                </Text>
                <Text style={{ color: '#8892A4', fontSize: 11 }}>{formatDate(txn.date)}</Text>
              </View>

              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>
                  +{formatNaira(txn.amount)}
                </Text>
                <View
                  style={{
                    backgroundColor: color + '18',
                    borderRadius: 8,
                    paddingHorizontal: 7,
                    paddingVertical: 2,
                  }}>
                  <Text style={{ color, fontSize: 10, fontWeight: '500' }}>{txn.status}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </Animated.View>
  );
}

export default function DashboardScreen() {
  const { useRouter } = require('expo-router');
  const router = useRouter();
  const vendor = MOCK_VENDOR;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#080B12' }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}>
        <Animated.View
          entering={FadeInDown.delay(0).duration(400)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 16,
            marginBottom: 20,
          }}>
          <View>
            <Text style={{ color: '#8892A4', fontSize: 12, marginBottom: 3 }}>Good morning 👋</Text>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '600' }}>
              {vendor.fullName.split(' ')[0]}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <TouchableOpacity
              style={{
                width: 40,
                height: 40,
                backgroundColor: '#0D1120',
                borderWidth: 1,
                borderColor: '#1E2535',
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Ionicons name="notifications-outline" size={18} color="#8892A4" />
              <View
                style={{
                  position: 'absolute',
                  top: 9,
                  right: 9,
                  width: 7,
                  height: 7,
                  borderRadius: 4,
                  backgroundColor: '#4361EE',
                  borderWidth: 1.5,
                  borderColor: '#080B12',
                }}
              />
            </TouchableOpacity>

            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: '#1a1f3a',
                borderWidth: 2,
                borderColor: '#4361EE',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text style={{ color: '#7B8FF7', fontSize: 16, fontWeight: '600' }}>
                {vendor.fullName.charAt(0)}
              </Text>
            </View>
          </View>
        </Animated.View>

        <TrustScoreCard />
        <StatsRow />
        <EarningsChart />
        <ScoreHistoryChart />
        <RecentTransactions onSeeAll={() => router.push('/(tabs)/transactions')} />
      </ScrollView>
    </SafeAreaView>
  );
}
