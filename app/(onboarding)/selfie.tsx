import { Button, Card, StepIndicator } from '@/components/onboarding/shared';
import { useVerifySelfie } from '@/lib/hooks/use-onboarding';
import { useOnboardingStore } from '@/lib/store/onboarding.store';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const LIVENESS_STEPS = ['Look straight ahead', 'Blink twice', 'Slowly turn left'];

function FaceGuide({ hasImage }: { hasImage: boolean }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!hasImage) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.04, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [hasImage]);

  return (
    <View className="my-6 items-center justify-center">
      {/* Outer ring */}
      <Animated.View
        style={{ transform: [{ scale: pulseAnim }] }}
        className="h-56 w-56 items-center justify-center rounded-full border-2 border-indigo-500">
        {/* Face oval */}
        <View
          className="h-52 w-44 items-center justify-center overflow-hidden rounded-full border border-canvas-border"
          style={{
            borderStyle: 'dashed',
            borderColor: hasImage ? '#20C997' : '#4361EE',
            borderWidth: hasImage ? 2 : 1,
          }}>
          {hasImage ? (
            <Text style={{ fontSize: 48 }}>✓</Text>
          ) : (
            <Text className="text-4xl text-canvas-muted">👤</Text>
          )}
        </View>

        {/* Corner brackets */}
        {[
          { top: 0, left: 16, rotate: '0deg' },
          { top: 0, right: 16, rotate: '90deg' },
          { bottom: 0, left: 16, rotate: '270deg' },
          { bottom: 0, right: 16, rotate: '180deg' },
        ].map((style, i) => (
          <View
            key={i}
            className="absolute h-6 w-6"
            style={{
              ...style,
              borderTopWidth: 2,
              borderLeftWidth: 2,
              borderColor: hasImage ? '#20C997' : '#4361EE',
              transform: [{ rotate: style.rotate }],
            }}
          />
        ))}
      </Animated.View>

      {/* Status text */}
      <Text
        className={`mt-4 text-sm font-medium ${hasImage ? 'text-teal-400' : 'text-canvas-muted'}`}>
        {hasImage ? 'Face captured' : 'Position your face in the oval'}
      </Text>
    </View>
  );
}

export default function SelfieScreen() {
  const router = useRouter();
  const { updateData, setStep } = useOnboardingStore();
  const { mutateAsync: verifySelfie, isPending } = useVerifySelfie();

  const [imageUri, setImageUri] = useState<string>('');
  const [livenessStep, setLivenessStep] = useState(0);
  const [verifyResult, setVerifyResult] = useState<{
    score: number;
    liveness: boolean;
  } | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setStep(3);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 450, useNativeDriver: true }),
    ]).start();
  }, []);

  const takeSelfie = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow camera access to take your selfie.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      allowsEditing: true,
      aspect: [1, 1],
      cameraType: ImagePicker.CameraType.front,
    });

    if (!result.canceled && result.assets[0]) {
      const compressed = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 800 } }],
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
      );
      setImageUri(compressed.uri);
      setVerifyResult(null);

      // Advance liveness check step (simulated)
      if (livenessStep < LIVENESS_STEPS.length - 1) {
        setLivenessStep((s) => s + 1);
      }
    }
  };

  const handleVerify = async () => {
    if (!imageUri) return;
    try {
      const res = await verifySelfie({
        vendorId: 'vnd_demo',
        selfieUri: imageUri,
      });
      setVerifyResult({ score: res.biometricScore, liveness: res.livenessPass });
      updateData({ selfieUri: imageUri });

      Animated.spring(successAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } catch (e) {
      Alert.alert('Face match failed', 'Please ensure good lighting and try again.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <View className="flex-1 px-6">
        {/* Header */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View className="mb-8 mt-4 flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-full border border-canvas-border bg-canvas-surface">
              <Text className="text-base text-white">←</Text>
            </TouchableOpacity>
            <StepIndicator total={4} current={2} />
            <View className="w-10" />
          </View>

          <Text className="mb-2 text-xs uppercase tracking-widest text-canvas-muted">
            Step 3 of 4
          </Text>
          <Text className="mb-2 text-3xl font-medium leading-tight text-white">
            Face{'\n'}
            <Text className="text-indigo-400">match</Text>
          </Text>
          <Text className="text-sm leading-relaxed text-canvas-muted">
            We'll compare your selfie to your document photo. Use your front camera in good light.
          </Text>
        </Animated.View>

        {/* Face guide / preview */}
        <Animated.View style={{ opacity: fadeAnim }}>
          {imageUri ? (
            <View className="relative my-6 items-center">
              <Image
                source={{ uri: imageUri }}
                className="h-44 w-44 rounded-full"
                resizeMode="cover"
              />
              {/* Teal ring if verified, indigo otherwise */}
              <View
                className="absolute inset-0 rounded-full border-2"
                style={{ borderColor: verifyResult ? '#20C997' : '#4361EE' }}
              />
              <TouchableOpacity
                onPress={() => {
                  setImageUri('');
                  setVerifyResult(null);
                }}
                className="absolute right-12 top-2 h-8 w-8 items-center justify-center rounded-full border border-canvas-border bg-canvas">
                <Text className="text-xs text-canvas-muted">✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FaceGuide hasImage={false} />
          )}
        </Animated.View>

        {/* Liveness steps */}
        {!verifyResult && (
          <Animated.View style={{ opacity: fadeAnim }} className="mb-6">
            <Text className="mb-3 text-xs uppercase tracking-widest text-canvas-muted">
              Liveness check
            </Text>
            <View className="flex-row gap-2">
              {LIVENESS_STEPS.map((step, i) => {
                const done = i < livenessStep;
                const active = i === livenessStep;
                return (
                  <View
                    key={i}
                    className={`flex-1 rounded-xl border p-3 ${
                      done
                        ? 'border-teal-700 bg-teal-900'
                        : active
                          ? 'border-indigo-500 bg-indigo-900'
                          : 'border-canvas-border bg-canvas-surface'
                    }`}>
                    <Text
                      className={`text-center text-xs ${
                        done ? 'text-teal-400' : active ? 'text-indigo-200' : 'text-canvas-muted'
                      }`}>
                      {done ? '✓' : `${i + 1}`}
                    </Text>
                    <Text
                      className={`mt-1 text-center text-xs leading-tight ${
                        done ? 'text-teal-400' : active ? 'text-indigo-200' : 'text-canvas-muted'
                      }`}>
                      {step}
                    </Text>
                  </View>
                );
              })}
            </View>
          </Animated.View>
        )}

        {/* Biometric result card */}
        {verifyResult && (
          <Animated.View
            style={{
              opacity: successAnim,
              transform: [
                { scale: successAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) },
              ],
            }}
            className="mb-4">
            <Card className="border-teal-700">
              <View className="mb-3 flex-row items-center gap-3">
                <View className="h-8 w-8 items-center justify-center rounded-full bg-teal-900">
                  <Text className="text-sm text-teal-400">✓</Text>
                </View>
                <Text className="text-sm font-medium text-teal-400">Face matched</Text>
                <View className="ml-auto rounded-full border border-teal-700 bg-teal-900 px-2 py-0.5">
                  <Text className="text-xs text-teal-300">{verifyResult.score}% confidence</Text>
                </View>
              </View>
              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className="mb-1 text-xs text-canvas-muted">Match confidence</Text>
                  <Text className="text-sm font-medium text-white">{verifyResult.score}%</Text>
                </View>
                <View className="flex-1">
                  <Text className="mb-1 text-xs text-canvas-muted">Liveness</Text>
                  <Text className="text-sm font-medium text-teal-400">Passed</Text>
                </View>
              </View>
            </Card>
          </Animated.View>
        )}

        <View className="flex-1" />

        {/* CTA */}
        <View className="gap-3 pb-6">
          {!imageUri ? (
            <Button label="Take selfie →" onPress={takeSelfie} />
          ) : !verifyResult ? (
            <Button
              label={isPending ? 'Matching face…' : 'Run face match →'}
              onPress={handleVerify}
              loading={isPending}
            />
          ) : (
            <Button label="Continue →" onPress={() => router.push('/(onboarding)/processing')} />
          )}
          {imageUri && !verifyResult && !isPending && (
            <Button label="Retake selfie" onPress={takeSelfie} variant="ghost" />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
