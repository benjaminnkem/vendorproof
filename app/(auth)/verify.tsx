import { useSendOTP, useVerifyOTP } from '@/lib/hooks/user-auth-mutations';
import { storage } from '@/lib/services/auth';
import { useAuthStore } from '@/lib/store/auth.store';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const OTP_LENGTH = 6;

function OTPBox({
  digit,
  focused,
  filled,
  hasError,
  index,
}: {
  digit: string;
  focused: boolean;
  filled: boolean;
  hasError: boolean;
  index: number;
}) {
  const scale = useSharedValue(1);
  const borderC = useSharedValue(0);

  useEffect(() => {
    if (focused) {
      borderC.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1.05, { damping: 12, stiffness: 300 });
    } else {
      borderC.value = withTiming(0, { duration: 200 });
      scale.value = withSpring(1, { damping: 14 });
    }
  }, [focused]);

  useEffect(() => {
    if (digit) {
      scale.value = withSequence(
        withSpring(1.15, { damping: 10, stiffness: 400 }),
        withSpring(1, { damping: 12 })
      );
    }
  }, [digit]);

  const boxStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderColor: hasError ? '#E63946' : focused ? '#4361EE' : filled ? '#20C997' : '#1E2535',
  }));

  return (
    <Animated.View
      entering={ZoomIn.delay(index * 60).springify()}
      style={boxStyle}
      className="h-14 w-12 items-center justify-center rounded-2xl border-2 bg-canvas-surface">
      {/* Cursor blink */}
      {focused && !digit ? (
        <Animated.View
          style={{
            width: 1.5,
            height: 20,
            backgroundColor: '#4361EE',
          }}
        />
      ) : (
        <Text
          className={`text-xl font-semibold ${hasError ? 'text-alert-400' : filled ? 'text-teal-400' : 'text-white'}`}>
          {digit}
        </Text>
      )}

      {/* Filled bottom bar */}
      {filled && !hasError && (
        <View className="absolute bottom-1.5 h-0.5 w-4 rounded-full bg-teal-500" />
      )}
    </Animated.View>
  );
}

function CountdownRing({ seconds, total }: { seconds: number; total: number }) {
  const progress = seconds / total;
  const color = seconds > 20 ? '#20C997' : seconds > 10 ? '#F0A500' : '#E63946';

  return (
    <View className="h-12 w-12 items-center justify-center">
      <View
        className="h-12 w-12 items-center justify-center rounded-full border-2"
        style={{ borderColor: color + '30' }}>
        <View
          className="absolute h-12 w-12 rounded-full border-2"
          style={{
            borderColor: color,
            borderTopColor: 'transparent',
            borderRightColor: progress > 0.5 ? color : 'transparent',
            transform: [{ rotate: `${(1 - progress) * 360}deg` }],
          }}
        />
        <Text className="text-xs font-bold text-white">{seconds}</Text>
      </View>
    </View>
  );
}

async function promptBiometric(): Promise<boolean> {
  try {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!compatible || !enrolled) return false;

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Confirm it's you",
      fallbackLabel: 'Use OTP instead',
      disableDeviceFallback: false,
    });

    return result.success;
  } catch {
    return false;
  }
}

export default function VerifyScreen() {
  const router = useRouter();
  const { phone, sessionId, expiresIn } = useLocalSearchParams<{
    phone: string;
    sessionId: string;
    expiresIn: string;
  }>();

  const { setTokens, setVendor, setBiometricEnabled } = useAuthStore();
  const { mutateAsync: verifyOTP, isPending } = useVerifyOTP();
  const { mutateAsync: sendOTP } = useSendOTP();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [focused, setFocused] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [countdown, setCountdown] = useState(parseInt(expiresIn ?? '60', 10));
  const [canResend, setCanResend] = useState(false);
  const [verified, setVerified] = useState(false);
  const [newSession, setNewSession] = useState(sessionId);

  const inputRefs = useRef<(TextInput | null)[]>(Array(OTP_LENGTH).fill(null));
  const timerRef = useRef<ReturnType<typeof setInterval>>(null as any);

  // Countdown timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current);
          setCanResend(true);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [newSession]);

  // Auto-verify when all 6 digits entered
  const fullOtp = otp.join('');
  useEffect(() => {
    if (fullOtp.length === OTP_LENGTH) {
      handleVerify(fullOtp);
    }
  }, [fullOtp]);

  const handleDigit = (text: string, index: number) => {
    setHasError(false);
    setErrorMsg('');

    // Handle paste of full OTP
    if (text.length === OTP_LENGTH) {
      const digits = text.slice(0, OTP_LENGTH).split('');
      setOtp(digits);
      inputRefs.current[OTP_LENGTH - 1]?.focus();
      return;
    }

    const digit = text.slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
      setFocused(index + 1);
    }
  };

  const handleBackspace = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      const next = [...otp];
      next[index - 1] = '';
      setOtp(next);
      inputRefs.current[index - 1]?.focus();
      setFocused(index - 1);
    }
  };

  const handleVerify = useCallback(
    async (code: string) => {
      if (isPending) return;
      setHasError(false);

      try {
        const res = await verifyOTP({ phone, otp: code, sessionId: newSession });

        // Persist to secure store
        await storage.setTokens(res.accessToken, res.refreshToken);
        await storage.setVendor(res.vendor);

        // Update Zustand
        setTokens(res.accessToken, res.refreshToken);
        setVendor(res.vendor);
        setVerified(true);

        // Offer biometric setup
        const hasBiometric = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (hasBiometric && isEnrolled) {
          setTimeout(() => {
            Alert.alert(
              'Enable biometric login?',
              'Sign in instantly next time with Face ID or fingerprint.',
              [
                {
                  text: 'Not now',
                  style: 'cancel',
                  onPress: () => router.replace('/(tabs)'),
                },
                {
                  text: 'Enable',
                  onPress: async () => {
                    await storage.setBiometricEnabled(true);
                    setBiometricEnabled(true);
                    router.replace('/(tabs)');
                  },
                },
              ]
            );
          }, 600);
        } else {
          setTimeout(() => router.replace('/(tabs)'), 700);
        }
      } catch (e: any) {
        setHasError(true);
        setErrorMsg(e?.message ?? 'Verification failed. Please try again.');
        setOtp(Array(OTP_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
        setFocused(0);
      }
    },
    [isPending, phone, newSession]
  );

  const handleResend = async () => {
    try {
      const res = await sendOTP({ phone });
      setNewSession(res.sessionId);
      setCountdown(res.expiresIn);
      setCanResend(false);
      setOtp(Array(OTP_LENGTH).fill(''));
      setHasError(false);
      setErrorMsg('');
      inputRefs.current[0]?.focus();
      setFocused(0);
    } catch (e: any) {
      setErrorMsg(e?.message ?? 'Could not resend OTP.');
    }
  };

  // Success checkmark scale
  const checkScale = useSharedValue(0);
  useEffect(() => {
    if (verified) {
      checkScale.value = withSpring(1, { damping: 10, stiffness: 200 });
    }
  }, [verified]);
  const checkStyle = useAnimatedStyle(() => ({ transform: [{ scale: checkScale.value }] }));

  const maskedPhone = phone.replace(/(\+234)(\d{3})(\d{4})(\d{4})/, '$1 $2 ****$4');

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View className="flex-1 justify-between px-6 py-6">
          {/* Back + header */}
          <Animated.View entering={FadeInDown.delay(0)} className="flex-row items-center gap-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-full border border-canvas-border bg-canvas-surface">
              <Ionicons name="arrow-back" size={18} color="#8892A4" />
            </TouchableOpacity>
            <View className="flex-row items-center gap-2">
              <MaterialCommunityIcons name="shield-check" size={16} color="#4361EE" />
              <Text className="text-sm font-semibold uppercase tracking-widest text-white">
                VendorProof
              </Text>
            </View>
          </Animated.View>

          {/* Copy */}
          <Animated.View entering={FadeInDown.delay(100)}>
            <Text className="mb-3 text-xs uppercase tracking-widest text-canvas-muted">
              Verification
            </Text>
            <Text className="mb-2 font-light text-white" style={{ fontSize: 34, lineHeight: 38 }}>
              Enter the{'\n'}
              <Text className="text-teal-400">6-digit code</Text>
            </Text>
            <View className="mt-1 flex-row items-center gap-2">
              <Text className="text-sm text-canvas-muted">Sent to</Text>
              <View className="rounded-full border border-canvas-border bg-canvas-surface px-3 py-1">
                <Text className="text-xs font-medium text-white">{maskedPhone}</Text>
              </View>
            </View>
          </Animated.View>

          {/* OTP boxes */}
          <View>
            {verified ? (
              <Animated.View style={checkStyle} className="items-center py-4">
                <View className="h-20 w-20 items-center justify-center rounded-full border-2 border-teal-500 bg-teal-900">
                  <Ionicons name="checkmark" size={40} color="#20C997" />
                </View>
                <Text className="mt-4 text-base font-semibold text-teal-400">Verified!</Text>
              </Animated.View>
            ) : (
              <>
                {/* Hidden master input captures keyboard */}
                <TextInput
                  ref={(r) => {
                    inputRefs.current[focused] = r;
                  }}
                  style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }}
                  keyboardType="number-pad"
                  value={otp[focused]}
                  onChangeText={(t) => handleDigit(t, focused)}
                  onKeyPress={({ nativeEvent }) => handleBackspace(nativeEvent.key, focused)}
                  maxLength={OTP_LENGTH}
                  autoFocus
                />

                <View className="mb-5 flex-row justify-between">
                  {otp.map((digit, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => {
                        setFocused(i);
                        inputRefs.current[i]?.focus();
                      }}>
                      <OTPBox
                        digit={digit}
                        focused={focused === i && !verified}
                        filled={!!digit}
                        hasError={hasError}
                        index={i}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Error message */}
                {hasError && errorMsg ? (
                  <Animated.View
                    entering={FadeInDown.duration(250)}
                    className="mb-4 flex-row items-center gap-2 rounded-xl border border-alert-700/40 bg-alert-900/40 px-3 py-2.5">
                    <Ionicons name="alert-circle-outline" size={15} color="#E63946" />
                    <Text className="text-alert-400 flex-1 text-xs">{errorMsg}</Text>
                  </Animated.View>
                ) : null}

                {/* Loading indicator */}
                {isPending && (
                  <Animated.View
                    entering={FadeInDown.duration(200)}
                    className="mb-4 flex-row items-center justify-center gap-3">
                    <View
                      className="h-4 w-4 rounded-full border-2 border-indigo-400 border-t-transparent"
                      style={{ borderTopColor: 'transparent' }}
                    />
                    <Text className="text-sm text-canvas-muted">Verifying…</Text>
                  </Animated.View>
                )}
              </>
            )}
          </View>

          {/* Bottom actions */}
          <Animated.View entering={FadeInUp.delay(300)} className="gap-4">
            {/* Countdown + resend */}
            <View className="flex-row items-center justify-between rounded-2xl border border-canvas-border bg-canvas-surface px-4 py-3">
              <View>
                <Text className="text-sm font-medium text-white">
                  {canResend ? 'OTP expired' : 'Code expires in'}
                </Text>
                <Text className="mt-0.5 text-xs text-canvas-muted">
                  {canResend ? 'Tap resend to get a new code' : 'Check your SMS'}
                </Text>
              </View>

              {canResend ? (
                <TouchableOpacity
                  onPress={handleResend}
                  className="rounded-xl border border-indigo-500/40 bg-indigo-900 px-4 py-2">
                  <Text className="text-sm font-semibold text-indigo-300">Resend</Text>
                </TouchableOpacity>
              ) : (
                <CountdownRing seconds={countdown} total={parseInt(expiresIn ?? '60', 10)} />
              )}
            </View>

            {/* Manual verify button — shows when all 6 filled */}
            {fullOtp.length === OTP_LENGTH && !isPending && !verified && (
              <Animated.View entering={FadeInUp.duration(300)}>
                <TouchableOpacity
                  onPress={() => handleVerify(fullOtp)}
                  className="items-center rounded-2xl bg-indigo-500 py-4 active:bg-indigo-700">
                  <Text className="text-sm font-semibold text-white">Verify & sign in →</Text>
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* Demo hint */}
            <View className="flex-row items-start gap-2 rounded-xl border border-canvas-border bg-canvas-surface px-4 py-3">
              <Ionicons name="bulb-outline" size={14} color="#7B8FF7" />
              <Text className="flex-1 text-xs leading-relaxed text-indigo-300/60">
                Demo OTP: <Text className="font-bold text-indigo-300">123456</Text>
              </Text>
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
