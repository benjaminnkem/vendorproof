import { useEffect, useState } from 'react';
import { Text, View, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedReaction,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { runOnJS } from 'react-native-worklets';

interface FadeSlideProps {
  children: React.ReactNode;
  delay?: number;
  style?: ViewStyle;
}

export function FadeSlide({ children, delay = 0, style }: FadeSlideProps) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(400).springify()} style={style}>
      {children}
    </Animated.View>
  );
}

interface CounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  style?: object;
  duration?: number;
}

export function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  style,
  duration = 1200,
}: CounterProps) {
  const animVal = useSharedValue(0);
  const [display, setDisplay] = useState(0);

  useAnimatedReaction(
    () => animVal.value,
    (current) => {
      runOnJS(setDisplay)(Math.round(current));
    }
  );

  useEffect(() => {
    animVal.value = withTiming(value, {
      duration,
      easing: Easing.out(Easing.quad),
    });
  }, [value]);

  return (
    <Text style={style}>
      {prefix}
      {display.toLocaleString('en-NG')}
      {suffix}
    </Text>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
  icon?: React.ReactNode;
  delay?: number;
}

export function StatCard({ label, value, sub, accent, icon, delay = 0 }: StatCardProps) {
  return (
    <FadeSlide delay={delay}>
      <View
        className="rounded-2xl border border-canvas-border bg-canvas-surface p-4"
        style={{ flex: 1 }}>
        {icon && <View className="mb-3">{icon}</View>}
        <Text className="mb-1.5 text-xs text-canvas-muted">{label}</Text>
        <Text className="text-xl font-medium text-white" style={{ color: accent || '#fff' }}>
          {value}
        </Text>
        {sub && <Text className="mt-1 text-xs text-canvas-muted">{sub}</Text>}
      </View>
    </FadeSlide>
  );
}

interface SectionHeadProps {
  title: string;
  action?: string;
  onAction?: () => void;
}

export function SectionHead({ title, action, onAction }: SectionHeadProps) {
  const { TouchableOpacity } = require('react-native');
  return (
    <View className="mb-4 flex-row items-center justify-between">
      <Text className="text-base font-medium text-white">{title}</Text>
      {action && (
        <TouchableOpacity onPress={onAction}>
          <Text className="text-sm text-indigo-400">{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function Divider({ className = '' }: { className?: string }) {
  return <View className={`h-px bg-canvas-border ${className}`} />;
}

export function TabScreen({ children }: { children: React.ReactNode }) {
  const { ScrollView } = require('react-native');
  const { SafeAreaView } = require('react-native-safe-area-context');
  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function ScanCorners({ color = '#4361EE', size = 16 }: { color?: string; size?: number }) {
  const corners = [
    { top: 0, left: 0 },
    { top: 0, right: 0 },
    { bottom: 0, left: 0 },
    { bottom: 0, right: 0 },
  ];
  return (
    <>
      {corners.map((pos, i) => {
        const isRight = 'right' in pos;
        const isBottom = 'bottom' in pos;
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              width: size,
              height: size,
              ...pos,
              borderTopWidth: isBottom ? 0 : 1.5,
              borderBottomWidth: isBottom ? 1.5 : 0,
              borderLeftWidth: isRight ? 0 : 1.5,
              borderRightWidth: isRight ? 1.5 : 0,
              borderColor: color,
            }}
          />
        );
      })}
    </>
  );
}
