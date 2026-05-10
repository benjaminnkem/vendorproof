import { Button } from '@/components/onboarding/shared';
import { useUpdateBusinessProfile } from '@/lib/hooks/use-onboarding';
import { useAuthStore } from '@/lib/store/auth.store';
import { useOnboardingStore } from '@/lib/store/onboarding.store';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

const schema = z.object({
  businessName: z.string().min(2, 'Business name is required'),
  businessDescription: z.string().max(500).optional(),
  businessPhoneNumber: z
    .string()
    .regex(/^(\+234|0)[789][01]\d{8}$/, 'Enter a valid Nigerian number'),
  kycBusinessTinNumber: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

function SectionLabel({ children }: { children: string }) {
  return (
    <Text className="mb-3 mt-6 px-0.5 text-xs uppercase tracking-widest text-canvas-muted">
      {children}
    </Text>
  );
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-5">
      <View className="mb-2 flex-row items-center gap-1">
        <Text className="text-xs uppercase tracking-wider text-canvas-muted">{label}</Text>
        {required && <Text className="text-xs text-indigo-400">*</Text>}
      </View>
      {children}
      {error && (
        <Animated.View
          entering={FadeInDown.duration(200)}
          className="mt-1.5 flex-row items-center gap-1.5">
          <Ionicons name="alert-circle-outline" size={12} color="#E63946" />
          <Text className="text-alert-400 text-xs">{error}</Text>
        </Animated.View>
      )}
    </View>
  );
}

function StyledInput({
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
  hasError,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
  multiline?: boolean;
  hasError?: boolean;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#8892A4"
      keyboardType={keyboardType ?? 'default'}
      multiline={multiline}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className={`rounded-xl border bg-canvas-surface px-4 py-3.5 text-sm text-white ${
        hasError ? 'border-alert-700' : focused ? 'border-indigo-500/60' : 'border-canvas-border'
      }`}
      style={multiline ? { textAlignVertical: 'top', minHeight: 100 } : {}}
    />
  );
}

export default function BusinessProfileScreen() {
  const router = useRouter();

  const [cacDocUri, setCacDocUri] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      businessName: '',
      businessDescription: '',
      businessPhoneNumber: '',
      kycBusinessTinNumber: '',
    },
  });

  const { mutateAsync: updateBusinessProfile, isPending: isUpdatingBusinessProfile } =
    useUpdateBusinessProfile();
  const {
    data: { accessToken },
    updateData,
  } = useOnboardingStore();
  const { setTokens } = useAuthStore();

  const pickDocument = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission required', 'Please allow access to your photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      const compressed = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 1200 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      setCacDocUri(compressed.uri);
    }
  };

  const onSubmit = async (values: FormValues) => {
    updateData({
      businessName: values.businessName,
      businessDescription: values.businessDescription,
      businessPhoneNumber: values.businessPhoneNumber,
      kycBusinessCacDocument: cacDocUri ?? undefined,
      kycBusinessTinNumber: values.kycBusinessTinNumber,
    });

    const formData = new FormData();
    formData.append('businessName', values.businessName);
    if (values.businessDescription)
      formData.append('businessDescription', values.businessDescription);
    if (values.businessPhoneNumber)
      formData.append('businessPhoneNumber', values.businessPhoneNumber);
    if (values.kycBusinessTinNumber)
      formData.append('kycBusinessTinNumber', values.kycBusinessTinNumber);

    if (cacDocUri)
      formData.append('kycBusinessCacDocument', {
        uri: cacDocUri,
        name: 'cac-document.jpg',
        type: 'image/jpeg',
      } as any);

    const result = await updateBusinessProfile({ accessToken: accessToken!, payload: formData });
    updateData({ accessToken: result.accessToken });
    setTokens(result.accessToken);
    router.push('/(onboarding)/processing');
  };

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <Animated.View
            entering={FadeInDown.delay(0)}
            className="mb-8 flex-row items-center justify-between pt-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-full border border-canvas-border bg-canvas-surface">
              <Ionicons name="arrow-back" size={18} color="#8892A4" />
            </TouchableOpacity>

            <View className="flex-row items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <View
                  key={i}
                  className="h-1 rounded-full"
                  style={{
                    width: i === 1 ? 24 : 8,
                    backgroundColor: i <= 1 ? '#4361EE' : '#1E2535',
                  }}
                />
              ))}
            </View>

            <View className="w-10" />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(60)} className="mb-8">
            <Text className="mb-2 text-xs uppercase tracking-widest text-canvas-muted">
              Step 2 of 3 · Business
            </Text>
            <Text className="mb-2 font-light text-white" style={{ fontSize: 32, lineHeight: 36 }}>
              Tell us about{'\n'}
              <Text className="text-indigo-400">your business</Text>
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(120)}>
            <SectionLabel>Business Information</SectionLabel>

            <Controller
              control={control}
              name="businessName"
              render={({ field: { value, onChange } }) => (
                <Field label="Business Name" required error={errors.businessName?.message}>
                  <StyledInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="e.g. Chinedu Electronics"
                    hasError={!!errors.businessName}
                  />
                </Field>
              )}
            />

            <Controller
              control={control}
              name="businessDescription"
              render={({ field: { value, onChange } }) => (
                <Field label="Business Description" error={errors.businessDescription?.message}>
                  <StyledInput
                    value={value ?? ''}
                    onChangeText={onChange}
                    placeholder="What does your business do? (optional)"
                    multiline
                    hasError={!!errors.businessDescription}
                  />
                </Field>
              )}
            />

            <Controller
              control={control}
              name="businessPhoneNumber"
              render={({ field: { value, onChange } }) => (
                <Field
                  label="Business Phone Number"
                  required
                  error={errors.businessPhoneNumber?.message}>
                  <StyledInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="08012345678"
                    keyboardType="phone-pad"
                    hasError={!!errors.businessPhoneNumber}
                  />
                </Field>
              )}
            />

            <SectionLabel>Business Verification (Optional)</SectionLabel>

            <Text className="mb-4 text-xs leading-relaxed text-canvas-muted">
              If your business is registered, upload your CAC document or provide your TIN number.
              You can skip this if your business is not yet formally registered.
            </Text>

            <View className="overflow-hidden rounded-2xl border border-canvas-border bg-canvas-surface">
              <TouchableOpacity
                onPress={pickDocument}
                className="flex-row items-center gap-3 border-b border-canvas-border px-4 py-5">
                <View className="h-11 w-11 items-center justify-center rounded-2xl bg-teal-900/40">
                  <MaterialCommunityIcons
                    name="file-certificate-outline"
                    size={24}
                    color={cacDocUri ? '#20C997' : '#8892A4'}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-white">CAC Certificate</Text>
                  <Text className="text-xs text-canvas-muted">
                    {cacDocUri ? 'Document uploaded ✓' : 'Tap to upload CAC document (optional)'}
                  </Text>
                </View>
                {cacDocUri && (
                  <TouchableOpacity onPress={() => setCacDocUri(null)}>
                    <Ionicons name="close-circle" size={20} color="#E63946" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>

              {!cacDocUri && (
                <View className="px-4 py-5">
                  <Text className="mb-2 text-xs text-canvas-muted">Or enter TIN Number</Text>
                  <Controller
                    control={control}
                    name="kycBusinessTinNumber"
                    render={({ field: { value, onChange } }) => (
                      <StyledInput
                        value={value ?? ''}
                        onChangeText={onChange}
                        placeholder="Your TIN number (optional)"
                        keyboardType="numeric"
                      />
                    )}
                  />
                </View>
              )}
            </View>
          </Animated.View>
        </ScrollView>

        <Animated.View
          entering={FadeInUp.delay(200)}
          className="border-t border-canvas-border bg-canvas px-5 pb-8 pt-3">
          {/* <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            className="items-center rounded-2xl bg-indigo-500 py-4 active:bg-indigo-700">
            <Text className="text-sm font-semibold text-white">Continue →</Text>
          </TouchableOpacity> */}
          <Button
            label="Continue"
            onPress={handleSubmit(onSubmit)}
            loading={isUpdatingBusinessProfile}
            disabled={isUpdatingBusinessProfile}
          />
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
