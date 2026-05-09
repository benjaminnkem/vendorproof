import { useSendOTP } from '@/lib/hooks/user-auth-mutations';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  FadeInUp,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

function GridTexture() {
  return (
    <View className="absolute inset-0 overflow-hidden opacity-[0.04]">
      {Array.from({ length: 20 }).map((_, row) =>
        Array.from({ length: 12 }).map((_, col) => (
          <View
            key={`${row}-${col}`}
            className="absolute border border-indigo-400"
            style={{
              width: width / 10,
              height: width / 10,
              left: col * (width / 10) - width * 0.1,
              top: row * (width / 10) - width * 0.1,
            }}
          />
        ))
      )}
    </View>
  );
}

function ShieldMark() {
  const floatY = useSharedValue(0);
  const glowO = useSharedValue(0.4);

  useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2200, easing: Easing.inOut(Easing.sin) })
      ),
      -1
    );
    glowO.value = withRepeat(
      withSequence(withTiming(1, { duration: 2200 }), withTiming(0.4, { duration: 2200 })),
      -1
    );
  }, []);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glowO.value }));

  return (
    <View className="mb-10 items-center justify-center">
      {/* Glow */}
      <Animated.View
        style={glowStyle}
        className="absolute h-24 w-24 rounded-full bg-indigo-500/20"
      />

      <Animated.View style={floatStyle}>
        {/* Outer hex border */}
        <View
          className="h-20 w-20 items-center justify-center"
          style={{
            borderWidth: 1,
            borderColor: '#4361EE40',
            borderRadius: 20,
            transform: [{ rotate: '15deg' }],
          }}>
          <View
            className="h-16 w-16 items-center justify-center border border-indigo-500/40 bg-canvas-surface"
            style={{ borderRadius: 16, transform: [{ rotate: '-15deg' }] }}>
            <MaterialCommunityIcons name="shield-check" size={30} color="#4361EE" />
          </View>
        </View>

        {/* Corner scan marks */}
        {[
          { top: -2, left: -2, borderTopWidth: 1.5, borderLeftWidth: 1.5 },
          { top: -2, right: -2, borderTopWidth: 1.5, borderRightWidth: 1.5 },
          { bottom: -2, left: -2, borderBottomWidth: 1.5, borderLeftWidth: 1.5 },
          { bottom: -2, right: -2, borderBottomWidth: 1.5, borderRightWidth: 1.5 },
        ].map((s, i) => (
          <View key={i} className="absolute h-3 w-3" style={{ ...s, borderColor: '#20C997' }} />
        ))}
      </Animated.View>
    </View>
  );
}

function PhoneInput({
  value,
  onChangeText,
  onFocus,
  onBlur,
  focused,
  inputRef,
}: {
  value: string;
  onChangeText: (t: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  focused: boolean;
  inputRef: React.RefObject<TextInput>;
}) {
  const borderO = useSharedValue(0);
  const glowScale = useSharedValue(1);

  useEffect(() => {
    borderO.value = withTiming(focused ? 1 : 0, { duration: 250 });
    glowScale.value = withSpring(focused ? 1.01 : 1, { damping: 15 });
  }, [focused]);

  const wrapStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    borderColor: interpolate(borderO.value, [0, 1], [0, 1]) > 0.5 ? '#4361EE' : '#1E2535',
    shadowOpacity: interpolate(borderO.value, [0, 1], [0, 0.4]),
  }));

  return (
    <Animated.View
      style={[
        wrapStyle,
        { shadowColor: '#4361EE', shadowRadius: 12, shadowOffset: { width: 0, height: 0 } },
      ]}
      className="mb-2 flex-row items-center rounded-2xl border bg-canvas-surface px-4">
      {/* Flag + country code */}
      <View className="flex-row items-center gap-2 border-r border-canvas-border pr-3">
        <Text style={{ fontSize: 20 }}>🇳🇬</Text>
        <Text className="text-sm font-medium text-white">+234</Text>
      </View>

      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder="803 214 5678"
        placeholderTextColor="#8892A4"
        keyboardType="phone-pad"
        maxLength={11}
        className="flex-1 py-4 pl-3 text-base text-white"
        style={{ fontFamily: 'System' }}
      />

      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')} className="p-1">
          <Ionicons name="close-circle" size={18} color="#8892A4" />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<TextInput>(null as any);

  const { mutateAsync: sendOTP, isPending } = useSendOTP();

  // Normalize: strip leading 0 for E.164, keep raw for display
  const normalizePhone = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    return digits.startsWith('0') ? `+234${digits.slice(1)}` : `+234${digits}`;
  };

  const isValid = /^0?[789][01]\d{8}$/.test(phone.replace(/\s/g, ''));

  const handleSend = async () => {
    if (!isValid) {
      setError('Please enter a valid Nigerian phone number.');
      return;
    }
    setError('');

    try {
      const res = await sendOTP({ phone: normalizePhone(phone) });
      router.push({
        pathname: '/(auth)/verify',
        params: {
          phone: normalizePhone(phone),
          sessionId: res.sessionId,
          expiresIn: res.expiresIn,
        },
      });
    } catch (e: any) {
      setError(e?.message ?? 'Something went wrong. Please try again.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <GridTexture />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View className="flex-1 justify-between px-6 py-8">
          {/* Top — logo */}
          <Animated.View
            entering={FadeInDown.delay(0).duration(500)}
            className="flex-row items-center gap-2">
            <MaterialCommunityIcons name="shield-check" size={18} color="#4361EE" />
            <Text className="text-sm font-semibold uppercase tracking-widest text-white">
              VendorProof
            </Text>
          </Animated.View>

          {/* Middle — shield + form */}
          <View>
            <Animated.View entering={FadeInDown.delay(100).duration(600)}>
              <ShieldMark />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(200).duration(500)} className="mb-8">
              <Text className="mb-3 text-xs uppercase tracking-widest text-canvas-muted">
                Welcome back
              </Text>
              <Text className="mb-2 font-light text-white" style={{ fontSize: 38, lineHeight: 42 }}>
                Sign in to{'\n'}
                <Text className="text-indigo-400">your account</Text>
              </Text>
              <Text className="text-sm leading-relaxed text-canvas-muted">
                Enter your registered phone number. We'll send a one-time code via SMS.
              </Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(300).duration(500)}>
              <Text className="mb-3 text-xs uppercase tracking-widest text-canvas-muted">
                Phone number
              </Text>

              <PhoneInput
                value={phone}
                onChangeText={(t) => {
                  setPhone(t);
                  setError('');
                }}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                focused={focused}
                inputRef={inputRef!}
              />

              {error ? (
                <Animated.View
                  entering={FadeInDown.duration(250)}
                  className="mt-2 flex-row items-center gap-2">
                  <Ionicons name="alert-circle-outline" size={14} color="#E63946" />
                  <Text className="flex-1 text-xs text-alert-500">{error}</Text>
                </Animated.View>
              ) : (
                <Text className="mt-2 text-xs text-canvas-muted">
                  e.g. 0803 214 5678 · Nigerian numbers only
                </Text>
              )}
            </Animated.View>
          </View>

          {/* Bottom — CTA */}
          <Animated.View entering={FadeInUp.delay(400).duration(500)} className="gap-4">
            <TouchableOpacity
              onPress={handleSend}
              disabled={isPending || !isValid}
              className={`items-center justify-center rounded-2xl py-4 ${
                isValid && !isPending ? 'bg-indigo-500 active:bg-indigo-700' : 'bg-canvas-surface'
              }`}>
              {isPending ? (
                <View className="flex-row items-center gap-3">
                  <Animated.View
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 8,
                      borderWidth: 2,
                      borderColor: '#fff',
                      borderTopColor: 'transparent',
                    }}
                  />
                  <Text className="text-sm font-medium text-canvas-muted">Sending OTP…</Text>
                </View>
              ) : (
                <Text
                  className={`text-sm font-semibold ${isValid ? 'text-white' : 'text-canvas-muted'}`}>
                  Send verification code →
                </Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center gap-3">
              <View className="h-px flex-1 bg-canvas-border" />
              <Text className="text-xs text-canvas-muted">or</Text>
              <View className="h-px flex-1 bg-canvas-border" />
            </View>

            <TouchableOpacity
              onPress={() => router.push('/(onboarding)')}
              className="items-center rounded-2xl border border-canvas-border py-4">
              <Text className="text-sm font-medium text-canvas-muted">
                New vendor? Get verified →
              </Text>
            </TouchableOpacity>

            {/* Demo hint */}
            <View className="flex-row items-start gap-2 rounded-xl border border-indigo-500/20 bg-indigo-900/30 px-4 py-3">
              <Ionicons name="information-circle-outline" size={15} color="#7B8FF7" />
              <Text className="flex-1 text-xs leading-relaxed text-indigo-300/70">
                Demo: any valid Nigerian number works. Use OTP{' '}
                <Text className="font-bold text-indigo-300">123456</Text> to sign in.
              </Text>
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
