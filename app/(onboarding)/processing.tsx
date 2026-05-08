import { useComputeTrustScore } from '@/lib/hooks/use-onboarding';
import { useOnboardingStore } from '@/lib/store/onboarding.store';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ProcessStep = {
  id: string;
  label: string;
  sublabel: string;
  duration: number;
};

const STEPS: ProcessStep[] = [
  {
    id: 'document',
    label: 'Analysing document signals',
    sublabel: 'OCR · Format check · Anomaly scan',
    duration: 1400,
  },
  {
    id: 'biometric',
    label: 'Computing biometric score',
    sublabel: 'Face embedding · Distance calculation',
    duration: 1200,
  },
  {
    id: 'behavioral',
    label: 'Building behavioral baseline',
    sublabel: 'Transaction history · Consistency',
    duration: 1000,
  },
  {
    id: 'composite',
    label: 'Generating composite Trust Score',
    sublabel: 'Weighted model · Tier assignment',
    duration: 900,
  },
];

function ProcessingStep({
  step,
  state,
  index,
}: {
  step: ProcessStep;
  state: 'pending' | 'active' | 'done';
  index: number;
}) {
  const dotAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      delay: index * 80,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (state === 'active') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dotAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(dotAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      dotAnim.stopAnimation();
      dotAnim.setValue(state === 'done' ? 1 : 0);
    }
  }, [state]);

  const dotOpacity = dotAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });

  return (
    <Animated.View style={{ opacity: fadeAnim }} className="mb-5 flex-row items-start gap-4">
      {/* Status dot / check */}
      <View className="mt-0.5 h-8 w-8 items-center justify-center">
        {state === 'done' ? (
          <View className="h-7 w-7 items-center justify-center rounded-full border border-teal-500 bg-teal-900">
            <Text className="text-xs text-teal-400">✓</Text>
          </View>
        ) : state === 'active' ? (
          <Animated.View
            style={{ opacity: dotOpacity }}
            className="h-7 w-7 items-center justify-center rounded-full border border-indigo-500 bg-indigo-900">
            <View className="h-2 w-2 rounded-full bg-indigo-400" />
          </Animated.View>
        ) : (
          <View className="h-7 w-7 items-center justify-center rounded-full border border-canvas-border bg-canvas-surface">
            <View className="h-2 w-2 rounded-full bg-canvas-border" />
          </View>
        )}
      </View>

      {/* Connector line */}
      <View className="flex-1">
        <Text
          className={`mb-0.5 text-sm font-medium ${
            state === 'done'
              ? 'text-teal-400'
              : state === 'active'
                ? 'text-white'
                : 'text-canvas-muted'
          }`}>
          {step.label}
        </Text>
        <Text className="text-xs text-canvas-muted">{step.sublabel}</Text>
      </View>
    </Animated.View>
  );
}

// Animated score counter
function ScoreCounter({ target }: { target: number }) {
  const animVal = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    animVal.addListener(({ value }) => setDisplay(Math.round(value)));
    Animated.timing(animVal, {
      toValue: target,
      duration: 1800,
      useNativeDriver: false,
    }).start();
    return () => animVal.removeAllListeners();
  }, [target]);

  return <Text className="text-7xl font-medium tracking-tight text-white">{display}</Text>;
}

export default function ProcessingScreen() {
  const router = useRouter();
  const { setTrustScore, setStep } = useOnboardingStore();
  const { mutateAsync: computeScore } = useComputeTrustScore();

  const [currentStep, setCurrentStep] = useState(0);
  const [done, setDone] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const logoAnim = useRef(new Animated.Value(0)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const ringRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setStep(4);

    Animated.timing(logoAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();

    // Spin the ring
    Animated.loop(
      Animated.timing(ringRotate, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();

    // Walk through steps sequentially
    let elapsed = 0;
    STEPS.forEach((step, i) => {
      setTimeout(() => setCurrentStep(i), elapsed);
      elapsed += step.duration;
    });

    // Hit the API after the step animations
    setTimeout(async () => {
      try {
        const result = await computeScore({ vendorId: 'vnd_demo' });
        setTrustScore(result);
        setFinalScore(result.overall);

        // Mark all done, show score
        setCurrentStep(STEPS.length);
        setDone(true);
        Animated.spring(scoreAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }).start();

        // Auto-navigate after score reveal
        setTimeout(() => router.replace('/(onboarding)/result'), 2800);
      } catch (e) {
        console.error('Score computation failed', e);
      }
    }, elapsed + 400);
  }, []);

  const ringDeg = ringRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <View className="flex-1 justify-center px-6">
        {/* Spinner + score */}
        <Animated.View style={{ opacity: logoAnim }} className="mb-12 items-center">
          {/* Rotating ring */}
          <View className="relative mb-6 h-32 w-32 items-center justify-center">
            <Animated.View
              style={{ transform: [{ rotate: ringDeg }] }}
              className="absolute inset-0 rounded-full border-2 border-transparent"
              // Dashed ring via border trick
            >
              <View
                className="h-full w-full rounded-full border-2 border-indigo-500"
                style={{ borderStyle: 'dashed', borderColor: '#4361EE60' }}
              />
            </Animated.View>

            {/* Static center ring */}
            <View className="h-24 w-24 items-center justify-center rounded-full border border-canvas-border bg-canvas-surface">
              {done ? (
                <Animated.View
                  style={{
                    opacity: scoreAnim,
                    transform: [
                      {
                        scale: scoreAnim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }),
                      },
                    ],
                  }}>
                  <ScoreCounter target={finalScore} />
                </Animated.View>
              ) : (
                <Text style={{ fontSize: 28 }}>🛡️</Text>
              )}
            </View>

            {/* Orbit dots */}
            {!done &&
              [0, 120, 240].map((deg, i) => {
                const rad = (deg * Math.PI) / 180;
                return (
                  <Animated.View
                    key={i}
                    className="absolute h-2 w-2 rounded-full bg-indigo-400"
                    style={{
                      transform: [
                        { rotate: ringDeg },
                        { translateX: Math.cos(rad) * 52 },
                        { translateY: Math.sin(rad) * 52 },
                      ],
                      opacity: 0.6 + i * 0.15,
                    }}
                  />
                );
              })}
          </View>

          <Text className="mb-1 text-xl font-medium text-white">
            {done ? 'Trust Score computed' : 'Computing your score…'}
          </Text>
          <Text className="text-center text-sm text-canvas-muted">
            {done ? 'Your Trust Badge is ready' : 'AI is analysing your verification data'}
          </Text>
        </Animated.View>

        {/* Step list */}
        <View className="rounded-2xl border border-canvas-border bg-canvas-surface p-5">
          <Text className="mb-5 text-xs uppercase tracking-widest text-canvas-muted">
            Verification pipeline
          </Text>
          {STEPS.map((step, i) => (
            <ProcessingStep
              key={step.id}
              step={step}
              index={i}
              state={i < currentStep ? 'done' : i === currentStep ? 'active' : 'pending'}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}
