import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

interface ButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'outline' | 'ghost';
  className?: string;
}

export function Button({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  className = '',
}: ButtonProps) {
  const base = 'rounded-full py-4 px-8 items-center justify-center flex-row';
  const variants = {
    primary: 'bg-indigo-500 active:bg-indigo-700',
    outline: 'border border-teal-500 bg-transparent active:bg-teal-900',
    ghost: 'bg-transparent active:bg-canvas-elevated',
  };
  const textVariants = {
    primary: 'text-white font-medium text-base',
    outline: 'text-teal-500 font-medium text-base',
    ghost: 'text-canvas-muted font-medium text-base',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${disabled ? 'opacity-40' : ''} ${className}`}
      activeOpacity={0.85}>
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'primary' ? '#ffffff' : '#20C997'} />
      ) : (
        <Text className={textVariants[variant]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  keyboardType?: 'default' | 'phone-pad' | 'email-address';
  autoCapitalize?: 'none' | 'words' | 'sentences';
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
}: InputProps) {
  const { TextInput } = require('react-native');

  return (
    <View className="mb-4">
      <Text className="mb-2 text-xs font-medium uppercase tracking-widest text-canvas-muted">
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8892A4"
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        className={`rounded-xl border bg-canvas-surface px-4 py-4 font-sans text-base text-white ${
          error ? 'border-alert-500' : 'border-canvas-border'
        }`}
      />
      {error ? <Text className="mt-1.5 text-xs text-alert-300">{error}</Text> : null}
    </View>
  );
}

interface StepIndicatorProps {
  total: number;
  current: number;
}

export function StepIndicator({ total, current }: StepIndicatorProps) {
  return (
    <View className="flex-row items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          className={`h-1 rounded-full transition-all ${
            i < current ? 'bg-teal-500' : i === current ? 'w-6 bg-indigo-500' : 'bg-canvas-border'
          }`}
          style={{ width: i === current ? 24 : 8 }}
        />
      ))}
    </View>
  );
}

interface ScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
}

export function Screen({ children, scrollable = false }: ScreenProps) {
  const { SafeAreaView } = require('react-native-safe-area-context');
  const { ScrollView } = require('react-native');

  if (scrollable) {
    return (
      <SafeAreaView className="flex-1 bg-canvas">
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-6 pb-10"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <View className="flex-1 px-6">{children}</View>
    </SafeAreaView>
  );
}

interface HeadingProps {
  title: string;
  accent?: string;
  subtitle?: string;
}

export function Heading({ title, accent, subtitle }: HeadingProps) {
  return (
    <View className="mb-8">
      <Text className="text-3xl font-medium leading-tight text-white">
        {title}
        {accent ? (
          <>
            {'\n'}
            <Text className="text-indigo-400">{accent}</Text>
          </>
        ) : null}
      </Text>
      {subtitle ? (
        <Text className="mt-3 text-sm leading-relaxed text-canvas-muted">{subtitle}</Text>
      ) : null}
    </View>
  );
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <View className={`rounded-2xl border border-canvas-border bg-canvas-surface p-4 ${className}`}>
      {children}
    </View>
  );
}

type Tier = 'unverified' | 'bronze' | 'silver' | 'gold' | 'platinum';

interface TierBadgeProps {
  tier: Tier;
}

const TIER_CONFIG: Record<Tier, { label: string; bg: string; text: string; border: string }> = {
  unverified: {
    label: 'Unverified',
    bg: 'bg-canvas-surface',
    text: 'text-canvas-muted',
    border: 'border-canvas-border',
  },
  bronze: {
    label: 'Bronze',
    bg: 'bg-gold-900',
    text: 'text-gold-300',
    border: 'border-gold-700',
  },
  silver: {
    label: 'Silver',
    bg: 'bg-[#1a1820]',
    text: 'text-[#B4B2A9]',
    border: 'border-[#2a2a35]',
  },
  gold: {
    label: 'Gold',
    bg: 'bg-gold-900',
    text: 'text-gold-300',
    border: 'border-gold-500',
  },
  platinum: {
    label: 'Platinum',
    bg: 'bg-teal-900',
    text: 'text-teal-300',
    border: 'border-teal-500',
  },
};

export function TierBadge({ tier }: TierBadgeProps) {
  const config = TIER_CONFIG[tier];
  return (
    <View className={`${config.bg} border ${config.border} rounded-full px-3 py-1`}>
      <Text className={`${config.text} text-xs font-medium`}>{config.label} Tier</Text>
    </View>
  );
}
