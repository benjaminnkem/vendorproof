import { storage } from '@/lib/config/storage';
import { useSignIn, useVerifyOTP } from '@/lib/hooks/user-auth-mutations';
import { payOnboarding } from '@/lib/services/onboarding-api';
import { useAuthStore } from '@/lib/store/auth.store';
import { useOnboardingStore } from '@/lib/store/onboarding.store';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import * as LocalAuthentication from 'expo-local-authentication';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
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
import Svg, { Circle } from 'react-native-svg';

const OTP_LENGTH = 6;
const OTP_EXPIRY_SECONDS = 900;

WebBrowser.maybeCompleteAuthSession();

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
          className={`text-xl font-semibold ${hasError ? 'text-alert-500' : filled ? 'text-teal-400' : 'text-white'}`}>
          {digit}
        </Text>
      )}

      {filled && !hasError && (
        <View className="absolute bottom-1.5 h-0.5 w-4 rounded-full bg-teal-500" />
      )}
    </Animated.View>
  );
}

function CountdownRing({ seconds, total }: { seconds: number; total: number }) {
  const SIZE = 52;
  const STROKE = 2.5;
  const RADIUS = (SIZE - STROKE) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  const progress = Math.max(0, Math.min(1, seconds / total));
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const label = seconds >= 60 ? `${minutes}:${secs.toString().padStart(2, '0')}` : `${seconds}`;

  const color = progress > 0.5 ? '#20C997' : progress > 0.2 ? '#F0A500' : '#E63946';

  return (
    <View style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={SIZE} height={SIZE} style={{ position: 'absolute', top: 0, left: 0 }}>
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="#1E2535"
          strokeWidth={STROKE}
        />
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={STROKE}
          strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
      </Svg>
      <Text style={{ color: '#ffffff', fontSize: seconds >= 60 ? 10 : 12, fontWeight: '700' }}>
        {label}
      </Text>
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
  const { phone, otp: demoOtp } = useLocalSearchParams<{ phone: string; otp: string }>();

  const { setTokens, setBiometricEnabled } = useAuthStore();
  const { mutateAsync: verifyOTP, isPending } = useVerifyOTP();
  const { mutateAsync: sendOTP } = useSignIn();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [focused, setFocused] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [countdown, setCountdown] = useState(OTP_EXPIRY_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const [verified, setVerified] = useState(false);

  const inputRefs = useRef<(TextInput | null)[]>(Array(OTP_LENGTH).fill(null));
  const timerRef = useRef<ReturnType<typeof setInterval>>(null as any);

  const { updateData } = useOnboardingStore();

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
  }, []);

  const fullOtp = otp.join('');
  // useEffect(() => {
  //   if (fullOtp.length === OTP_LENGTH) {
  //     handleVerify(fullOtp);
  //   }
  // }, [fullOtp]);

  const handleDigit = (text: string, index: number) => {
    setHasError(false);
    setErrorMsg('');

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

  const {
    data: payOnboardingData,
    mutateAsync: payOnboardingMutation,
    isPending: isPayOnboardingPending,
  } = useMutation({ mutationFn: payOnboarding });

  const handleVerify = useCallback(
    async (code: string) => {
      if (isPending) return;
      setHasError(false);

      try {
        const res = await verifyOTP({ phoneNumber: phone, otp: code });
        const data = res.data;

        if (data.nextStep) {
          updateData({ accessToken: data.accessToken });
        } else {
          await storage.setTokens(data.accessToken);
          setTokens(data.accessToken);
          setVerified(true);
        }

        switch (data.nextStep) {
          case 3:
            router.replace({
              pathname: '/(onboarding)/kyc-identity',
              params: { fromSignIn: 'true' },
            });
            break;
          case 4:
            router.replace({
              pathname: '/(onboarding)/business-profile',
              params: { fromSignIn: 'true' },
            });
            break;
          case 5:
            const result = await payOnboardingMutation({
              accessToken: data.accessToken,
            });

            if (result.message.toLowerCase().includes('already paid')) {
              await storage.setTokens(data.accessToken);
              setTokens(data.accessToken);
              router.replace({ pathname: '/(tabs)' });
              return;
            }

            const { checkoutUrl } = result.data;

            await storage.setTokens(data.accessToken);
            setTokens(data.accessToken);

            router.replace({
              pathname: '/(payment)/payment',
              params: { uri: checkoutUrl },
            });
            break;
          default:
            router.replace({ pathname: '/(tabs)' });
            break;
        }

        // return;
      } catch (e: any) {
        setHasError(true);
        setErrorMsg(e?.message ?? 'Verification failed. Please try again.');
        setOtp(Array(OTP_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
        setFocused(0);
      }
    },
    [isPending, phone]
  );

  const handleResend = async () => {
    try {
      const res = await sendOTP({ phoneNumber: phone });
      // setCountdown(res.expiresIn);
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

                {hasError && errorMsg ? (
                  <Animated.View
                    entering={FadeInDown.duration(250)}
                    className="mb-4 flex-row items-center gap-2 rounded-xl border border-alert-700/40 bg-alert-900/40 px-3 py-2.5">
                    <Ionicons name="alert-circle-outline" size={15} color="#E63946" />
                    <Text className="flex-1 text-xs text-alert-500">{errorMsg}</Text>
                  </Animated.View>
                ) : null}

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

          <Animated.View entering={FadeInUp.delay(300)} className="gap-4">
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
                <CountdownRing seconds={countdown} total={OTP_EXPIRY_SECONDS} />
              )}
            </View>

            {fullOtp.length === OTP_LENGTH && !isPending && !verified && (
              <Animated.View entering={FadeInUp.duration(300)}>
                <TouchableOpacity
                  onPress={() => handleVerify(fullOtp)}
                  className="items-center rounded-2xl bg-indigo-500 py-4 active:bg-indigo-700">
                  <Text className="text-sm font-semibold text-white">Verify & sign in →</Text>
                </TouchableOpacity>
              </Animated.View>
            )}

            <View className="flex-row items-start gap-2 rounded-xl border border-canvas-border bg-canvas-surface px-4 py-3">
              <Ionicons name="bulb-outline" size={14} color="#7B8FF7" />
              <Text className="flex-1 text-xs leading-relaxed text-indigo-300/60">
                Demo OTP: <Text className="font-bold text-indigo-300">{demoOtp}</Text>
              </Text>
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
