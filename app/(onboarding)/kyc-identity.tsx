import { useUpdateKycDocuments } from '@/lib/hooks/use-onboarding';
import { useOnboardingStore } from '@/lib/store/onboarding.store';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

type CaptureState = 'idle' | 'captured';

interface KYCImageSlot {
  uri: string | null;
  state: CaptureState;
}

function ScanFrame({ active }: { active: boolean }) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    if (active) {
      opacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.4, { duration: 800, easing: Easing.inOut(Easing.sin) })
        ),
        -1
      );
    } else {
      opacity.value = withTiming(1, { duration: 300 });
    }
  }, [active]);

  const frameStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const color = active ? '#4361EE' : '#20C997';

  return (
    <Animated.View style={frameStyle} className="absolute inset-0">
      {[
        'absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2',
        'absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2',
        'absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2',
        'absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2',
      ].map((cls, i) => (
        <View key={i} className={cls} style={{ borderColor: color }} />
      ))}
    </Animated.View>
  );
}

function ImageCaptureTile({
  label,
  sublabel,
  icon,
  slot,
  onCamera,
  onGallery,
  onClear,
  aspect,
  delay,
}: {
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  slot: KYCImageSlot;
  onCamera: () => void;
  onGallery: () => void;
  onClear: () => void;
  aspect: [number, number];
  delay: number;
}) {
  const scale = useSharedValue(1);
  const captured = slot.state === 'captured';

  const tileStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()}>
      <Animated.View
        style={tileStyle}
        className={`overflow-hidden rounded-3xl border ${
          captured ? 'border-teal-700/60' : 'border-canvas-border'
        } bg-canvas-surface`}>
        {slot.uri ? (
          <View className="relative">
            <Image
              source={{ uri: slot.uri }}
              className="w-full"
              style={{ height: aspect[0] > aspect[1] ? 160 : 200 }}
              resizeMode="cover"
            />
            <View className="absolute inset-0 bg-canvas/20" />
            <ScanFrame active={false} />
            <TouchableOpacity
              onPress={onClear}
              className="absolute right-3 top-3 h-8 w-8 items-center justify-center rounded-full border border-canvas-border bg-canvas/80">
              <Ionicons name="close" size={14} color="#8892A4" />
            </TouchableOpacity>
            <View className="absolute bottom-3 left-3 flex-row items-center gap-1.5 rounded-full border border-teal-700/60 bg-teal-900/90 px-2.5 py-1">
              <View className="h-1.5 w-1.5 rounded-full bg-teal-400" />
              <Text className="text-xs font-medium text-teal-300">Captured</Text>
            </View>
          </View>
        ) : (
          <View className="p-5">
            <View className="mb-5 flex-row items-start gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-2xl border border-canvas-border bg-canvas-elevated">
                {icon}
              </View>
              <View className="flex-1">
                <Text className="mb-0.5 text-sm font-semibold text-white">{label}</Text>
                <Text className="text-xs leading-relaxed text-canvas-muted">{sublabel}</Text>
              </View>
            </View>

            <View
              className="relative mb-4 items-center justify-center rounded-2xl border-2 border-dashed border-canvas-border py-8"
              style={{ borderColor: '#1E2535' }}>
              <ScanFrame active={true} />
              <MaterialCommunityIcons name="image-plus" size={28} color="#8892A4" />
              <Text className="mt-2 text-xs text-canvas-muted">No image selected</Text>
            </View>

            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={onCamera}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-indigo-500/40 bg-indigo-900/60 py-3">
                <Ionicons name="camera-outline" size={16} color="#7B8FF7" />
                <Text className="text-sm font-medium text-indigo-300">Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onGallery}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-canvas-border bg-canvas-elevated py-3">
                <Ionicons name="images-outline" size={16} color="#8892A4" />
                <Text className="text-sm font-medium text-canvas-muted">Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Animated.View>
    </Animated.View>
  );
}

export default function KYCIdentityScreen() {
  const router = useRouter();
  const { updateData } = useOnboardingStore();

  const [selfie, setSelfie] = useState<KYCImageSlot>({ uri: null, state: 'idle' });
  const [idDoc, setIdDoc] = useState<KYCImageSlot>({ uri: null, state: 'idle' });

  const { fromSignIn } = useLocalSearchParams<{ fromSignIn: string }>();

  const canContinue = selfie.state === 'captured' && idDoc.state === 'captured';

  const { mutateAsync: handleUpdateKycDocuments, isPending: isUpdatingKycDocuments } =
    useUpdateKycDocuments();
  const {
    data: { accessToken },
  } = useOnboardingStore();

  const pickImage = async (
    source: 'camera' | 'gallery',
    cameraType: ImagePicker.CameraType,
    aspect: [number, number],
    onSet: (slot: KYCImageSlot) => void
  ) => {
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permission required',
        `Please allow ${source === 'camera' ? 'camera' : 'photo library'} access to continue.`
      );
      return;
    }

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.9,
            allowsEditing: true,
            aspect,
            cameraType,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.9,
            allowsEditing: true,
            aspect,
          });

    if (!result.canceled && result.assets[0]) {
      const compressed = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 1200 } }],
        { compress: 0.82, format: ImageManipulator.SaveFormat.JPEG }
      );
      onSet({ uri: compressed.uri, state: 'captured' });
    }
  };

  const handleContinue = async () => {
    updateData({
      kycSelfie: selfie.uri!,
      kycIdDocument: idDoc.uri!,
    });

    const formData = new FormData();
    formData.append('kycSelfie', {
      uri: selfie.uri!,
      name: 'kycSelfie.jpg',
      type: 'image/jpeg',
    } as any);
    formData.append('kycIdDocument', {
      uri: idDoc.uri!,
      name: 'kycIdDocument.jpg',
      type: 'image/jpeg',
    } as any);

    await handleUpdateKycDocuments({ payload: formData, accessToken: accessToken! });
    router.push('/(onboarding)/business-profile');
  };

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <Animated.View
          entering={FadeInDown.delay(0)}
          className="mb-8 flex-row items-center justify-between pt-4">
          {fromSignIn == 'true' ? (
            <View className="size-10"></View>
          ) : (
            <TouchableOpacity
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-full border border-canvas-border bg-canvas-surface">
              <Ionicons name="arrow-back" size={18} color="#8892A4" />
            </TouchableOpacity>
          )}

          <View className="flex-row items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                className="h-1 rounded-full"
                style={{
                  width: i === 0 ? 24 : 8,
                  backgroundColor: i === 0 ? '#4361EE' : '#1E2535',
                }}
              />
            ))}
          </View>

          <View className="w-10" />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60)} className="mb-8">
          <Text className="mb-2 text-xs uppercase tracking-widest text-canvas-muted">
            Step 1 of 3 · Identity
          </Text>
          <Text className="mb-2 font-light text-white" style={{ fontSize: 32, lineHeight: 36 }}>
            Verify your{'\n'}
            <Text className="text-indigo-400">identity</Text>
          </Text>
          <Text className="text-sm leading-relaxed text-canvas-muted">
            We need a clear selfie and a valid government-issued ID. Both are processed securely by
            our AI verification engine.
          </Text>
        </Animated.View>

        <View className="mb-8 gap-4">
          <ImageCaptureTile
            label="Live selfie"
            sublabel="Look straight at the camera. Ensure good lighting and no sunglasses."
            icon={<Ionicons name="person-outline" size={18} color="#7B8FF7" />}
            slot={selfie}
            onCamera={() => pickImage('camera', ImagePicker.CameraType.front, [1, 1], setSelfie)}
            onGallery={() => pickImage('gallery', ImagePicker.CameraType.front, [1, 1], setSelfie)}
            onClear={() => setSelfie({ uri: null, state: 'idle' })}
            aspect={[1, 1]}
            delay={120}
          />

          <ImageCaptureTile
            label="Government-issued ID"
            sublabel="NIN slip, driver's licence, or international passport. Full document must be visible."
            icon={
              <MaterialCommunityIcons
                name="card-account-details-outline"
                size={18}
                color="#7B8FF7"
              />
            }
            slot={idDoc}
            onCamera={() => pickImage('camera', ImagePicker.CameraType.back, [4, 3], setIdDoc)}
            onGallery={() => pickImage('gallery', ImagePicker.CameraType.back, [4, 3], setIdDoc)}
            onClear={() => setIdDoc({ uri: null, state: 'idle' })}
            aspect={[4, 3]}
            delay={200}
          />
        </View>

        <Animated.View entering={FadeInDown.delay(280)} className="mb-6">
          <View className="flex-row items-start gap-3 rounded-2xl border border-indigo-500/20 bg-indigo-900/30 px-4 py-3.5">
            <Ionicons name="lock-closed-outline" size={15} color="#7B8FF7" />
            <Text className="flex-1 text-xs leading-relaxed text-indigo-300/70">
              Your images are encrypted in transit, processed by our AI engine, and never shared
              with third parties.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      <Animated.View
        entering={FadeInUp.delay(300)}
        className="border-t border-canvas-border bg-canvas px-5 pb-8 pt-3">
        <TouchableOpacity
          onPress={handleContinue}
          disabled={!canContinue || isUpdatingKycDocuments}
          className={`items-center rounded-2xl py-4 ${
            canContinue ? 'bg-indigo-500 active:bg-indigo-700' : 'bg-canvas-surface'
          }`}>
          <Text
            className={`text-sm font-semibold ${canContinue ? 'text-white' : 'text-canvas-muted'}`}>
            {canContinue
              ? isUpdatingKycDocuments
                ? 'Uploading...'
                : 'Continue to business profile →'
              : 'Upload both images to continue'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}
