import { Button, Card, StepIndicator } from '@/components/onboarding/shared';
import { useVerifyDocument } from '@/lib/hooks/use-onboarding';
import type { DocumentType } from '@/lib/store/onboarding.store';
import { useOnboardingStore } from '@/lib/store/onboarding.store';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type DocOption = {
  id: DocumentType;
  label: string;
  sublabel: string;
  icon: string;
};

const DOC_OPTIONS: DocOption[] = [
  {
    id: 'nin',
    label: 'NIN Slip',
    sublabel: 'National Identification Number',
    icon: '🪪',
  },
  {
    id: 'cac',
    label: 'CAC Certificate',
    sublabel: 'Business registration document',
    icon: '📋',
  },
  {
    id: 'utility',
    label: 'Utility Bill',
    sublabel: 'Not older than 3 months',
    icon: '🧾',
  },
];

export default function DocumentScreen() {
  const router = useRouter();
  const { data, updateData, setStep } = useOnboardingStore();
  const { mutateAsync: verifyDocument, isPending } = useVerifyDocument();

  const [selectedType, setSelectedType] = useState<DocumentType | ''>('nin');
  const [imageUri, setImageUri] = useState<string>('');
  const [verifyResult, setVerifyResult] = useState<{
    score: number;
    name: string;
    valid: boolean;
  } | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setStep(2);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 450, useNativeDriver: true }),
    ]).start();
  }, []);

  const pickImage = async (source: 'camera' | 'gallery') => {
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission required', `Please allow ${source} access to upload your document.`);
      return;
    }

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.85,
            allowsEditing: true,
            aspect: [4, 3],
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.85,
            allowsEditing: true,
            aspect: [4, 3],
          });

    if (!result.canceled && result.assets[0]) {
      // Compress before upload
      const compressed = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 1200 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      setImageUri(compressed.uri);
      setVerifyResult(null);
    }
  };

  const handleVerify = async () => {
    if (!imageUri || !selectedType) return;

    try {
      const res = await verifyDocument({
        vendorId: 'vnd_demo', // replace with store.vendorId after register
        documentType: selectedType,
        documentUri: imageUri,
      });

      setVerifyResult({
        score: res.documentScore,
        name: res.extractedName,
        valid: res.documentValid,
      });

      updateData({ documentType: selectedType, documentUri: imageUri });

      // Animate success card in
      Animated.spring(successAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } catch (e) {
      Alert.alert('Verification failed', 'Please try uploading a clearer image.');
    }
  };

  const canContinue = verifyResult?.valid;

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
            <StepIndicator total={4} current={1} />
            <View className="w-10" />
          </View>

          <Text className="mb-2 text-xs uppercase tracking-widest text-canvas-muted">
            Step 2 of 4
          </Text>
          <Text className="mb-2 text-3xl font-medium leading-tight text-white">
            Upload your{'\n'}
            <Text className="text-indigo-400">document</Text>
          </Text>
          <Text className="mb-6 text-sm leading-relaxed text-canvas-muted">
            Our AI scans for authenticity and extracts your details automatically.
          </Text>
        </Animated.View>

        {/* Doc type selector */}
        <Animated.View style={{ opacity: fadeAnim }} className="mb-6">
          <Text className="mb-3 text-xs uppercase tracking-widest text-canvas-muted">
            Document type
          </Text>
          <View className="gap-2">
            {DOC_OPTIONS.map((opt) => {
              const isSelected = selectedType === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  onPress={() => {
                    setSelectedType(opt.id);
                    setImageUri('');
                    setVerifyResult(null);
                  }}
                  className={`flex-row items-center gap-3 rounded-xl border px-4 py-3.5 ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-900'
                      : 'border-canvas-border bg-canvas-surface'
                  }`}>
                  <Text style={{ fontSize: 20 }}>{opt.icon}</Text>
                  <View className="flex-1">
                    <Text
                      className={`text-sm font-medium ${
                        isSelected ? 'text-indigo-200' : 'text-white'
                      }`}>
                      {opt.label}
                    </Text>
                    <Text className="mt-0.5 text-xs text-canvas-muted">{opt.sublabel}</Text>
                  </View>
                  {isSelected && (
                    <View className="h-5 w-5 items-center justify-center rounded-full bg-indigo-500">
                      <Text className="text-xs text-white">✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        {/* Upload area */}
        <Animated.View style={{ opacity: fadeAnim }} className="mb-4">
          {imageUri ? (
            <View className="relative">
              <Image
                source={{ uri: imageUri }}
                className="h-44 w-full rounded-2xl"
                resizeMode="cover"
              />
              {/* Scan line overlay */}
              <View className="absolute inset-0 overflow-hidden rounded-2xl border border-indigo-500">
                <View className="absolute left-2 top-2 h-5 w-5 border-l-2 border-t-2 border-teal-400" />
                <View className="absolute right-2 top-2 h-5 w-5 border-r-2 border-t-2 border-teal-400" />
                <View className="absolute bottom-2 left-2 h-5 w-5 border-b-2 border-l-2 border-teal-400" />
                <View className="absolute bottom-2 right-2 h-5 w-5 border-b-2 border-r-2 border-teal-400" />
              </View>
              <TouchableOpacity
                onPress={() => {
                  setImageUri('');
                  setVerifyResult(null);
                }}
                className="absolute right-3 top-3 h-8 w-8 items-center justify-center rounded-full border border-canvas-border bg-canvas">
                <Text className="text-xs text-canvas-muted">✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="items-center gap-3 rounded-2xl border-2 border-dashed border-canvas-border p-8">
              <View className="h-14 w-14 items-center justify-center rounded-2xl bg-canvas-surface">
                <Text style={{ fontSize: 24 }}>📄</Text>
              </View>
              <Text className="text-sm font-medium text-white">Upload document</Text>
              <Text className="text-center text-xs text-canvas-muted">
                JPG, PNG · Max 5MB · Clear, well-lit photo
              </Text>
              <View className="mt-2 flex-row gap-3">
                <TouchableOpacity
                  onPress={() => pickImage('camera')}
                  className="flex-row items-center gap-2 rounded-full border border-indigo-500 bg-indigo-900 px-4 py-2.5">
                  <Text style={{ fontSize: 14 }}>📷</Text>
                  <Text className="text-sm font-medium text-indigo-200">Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => pickImage('gallery')}
                  className="flex-row items-center gap-2 rounded-full border border-canvas-border bg-canvas-surface px-4 py-2.5">
                  <Text style={{ fontSize: 14 }}>🖼️</Text>
                  <Text className="text-sm font-medium text-canvas-muted">Gallery</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Animated.View>

        {/* AI result card */}
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
                <Text className="text-sm font-medium text-teal-400">Document verified</Text>
                <View className="ml-auto rounded-full border border-teal-700 bg-teal-900 px-2 py-0.5">
                  <Text className="text-xs text-teal-300">{verifyResult.score}/100</Text>
                </View>
              </View>
              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className="mb-1 text-xs text-canvas-muted">Extracted name</Text>
                  <Text className="text-sm font-medium text-white">{verifyResult.name}</Text>
                </View>
                <View className="flex-1">
                  <Text className="mb-1 text-xs text-canvas-muted">Authenticity</Text>
                  <Text className="text-sm font-medium text-teal-400">Passed</Text>
                </View>
              </View>
            </Card>
          </Animated.View>
        )}

        <View className="flex-1" />

        {/* CTA */}
        <View className="gap-3 pb-6">
          {!verifyResult ? (
            <Button
              label={isPending ? 'AI scanning document…' : 'Scan document →'}
              onPress={handleVerify}
              loading={isPending}
              disabled={!imageUri}
            />
          ) : (
            <Button
              label="Continue to face match →"
              onPress={() => router.push('/(onboarding)/selfie')}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
