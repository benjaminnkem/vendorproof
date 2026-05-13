import { Button } from '@/components/onboarding/shared';
import { showToast } from '@/lib/config/toast';
import useUser from '@/lib/hooks/use-user';
import { updateBusinessProfile } from '@/lib/services/business-api';
import { useAuthStore } from '@/lib/store/auth.store';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  Image,
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
    .regex(/^(\+234|0)[789][01]\d{8}$/, 'Enter a valid Nigerian number')
    .optional(),
  businessCategory: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const CATEGORIES = [
  { id: 'electronics', label: 'Electronics', icon: 'phone-portrait-outline' },
  { id: 'fashion', label: 'Fashion', icon: 'shirt-outline' },
  { id: 'food', label: 'Food & Drinks', icon: 'restaurant-outline' },
  { id: 'logistics', label: 'Logistics', icon: 'train-outline' },
  { id: 'beauty', label: 'Beauty', icon: 'sparkles-outline' },
  { id: 'services', label: 'Services', icon: 'construct-outline' },
  { id: 'groceries', label: 'Groceries', icon: 'cart-outline' },
  { id: 'other', label: 'Other', icon: 'cube-outline' },
];

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
          <Text className="text-xs text-alert-500">{error}</Text>
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
      value={value ?? ''}
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

export default function EditBusinessScreen() {
  const router = useRouter();
  const { user, refetch } = useUser();

  const [businessLogoUri, setBusinessLogoUri] = useState<string | null>(null);
  const [showcaseImages, setShowcaseImages] = useState<string[]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      businessName: user?.business.name || '',
      businessDescription: user?.business.description || '',
      businessPhoneNumber: user?.business.phoneNumber || '',
      businessCategory: user?.business.category || '',
    },
  });

  const selectedCategory = watch('businessCategory');

  const { mutate, isPending: isUpdating } = useMutation({
    mutationFn: (payload: { payload: FormData; accessToken: string }) =>
      updateBusinessProfile(payload),
  });
  const { accessToken } = useAuthStore();

  useEffect(() => {
    if (user?.business) {
      reset({
        businessName: user.business.name || '',
        businessDescription: user.business.description || '',
        businessPhoneNumber: user.business.phoneNumber || '',
        businessCategory: user.business.category || '',
      });

      if (user.business.logo) {
        setBusinessLogoUri(user.business.logo);
      }

      if (user.business.showcaseImages?.length) {
        setShowcaseImages(user.business.showcaseImages);
      }
    }
  }, [user, reset]);

  const pickImage = async (setUri: (uri: string | null) => void) => {
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
      setUri(compressed.uri);
    }
  };

  const pickShowcaseImages = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission required', 'Please allow access to your photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: true,
      allowsMultipleSelection: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      const newUris: string[] = [];
      for (const asset of result.assets) {
        const compressed = await ImageManipulator.manipulateAsync(
          asset.uri,
          [{ resize: { width: 1200 } }],
          { compress: 0.75, format: ImageManipulator.SaveFormat.JPEG }
        );
        newUris.push(compressed.uri);
      }
      setShowcaseImages((prev) => [...prev, ...newUris].slice(0, 10));
    }
  };

  const removeShowcaseImage = (index: number) => {
    setShowcaseImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: FormValues) => {
    const formData = new FormData();
    formData.append('name', values.businessName);

    if (values.businessDescription) formData.append('description', values.businessDescription);
    if (values.businessPhoneNumber) formData.append('phoneNumber', values.businessPhoneNumber);
    if (values.businessCategory) formData.append('category', values.businessCategory);

    if (businessLogoUri && !businessLogoUri.startsWith('http')) {
      formData.append('businessLogo', {
        uri: businessLogoUri,
        name: 'business-logo.jpg',
        type: 'image/jpeg',
      } as any);
    }

    for (const uri of showcaseImages) {
      if (!uri.startsWith('http')) {
        formData.append('businessShowCaseImages', {
          uri,
          name: 'showcase-image.jpg',
          type: 'image/jpeg',
        } as any);
      }
    }

    mutate(
      {
        payload: formData,
        accessToken: accessToken || '',
      },
      {
        onError: (error: any) => {
          showToast.error(error?.message || 'Failed to update business profile');
        },
        onSuccess: () => {
          showToast.success('Business profile updated successfully');
          refetch();
          router.back();
        },
      }
    );
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

            <Text className="text-lg font-semibold text-white">Edit Business</Text>

            <View className="w-10" />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(80)}>
            <SectionLabel>Business Information</SectionLabel>

            <View className="mb-6">
              <Text className="mb-2 text-xs uppercase tracking-wider text-canvas-muted">
                Business Logo (Optional)
              </Text>
              <TouchableOpacity
                onPress={() => pickImage(setBusinessLogoUri)}
                className="h-40 w-full items-center justify-center overflow-hidden rounded-3xl border border-dashed border-canvas-border bg-canvas-surface">
                {businessLogoUri ? (
                  <Image
                    source={{ uri: businessLogoUri }}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="items-center">
                    <View className="mb-2 h-14 w-14 items-center justify-center rounded-2xl bg-indigo-900/30">
                      <MaterialCommunityIcons name="camera-plus" size={28} color="#6366F1" />
                    </View>
                    <Text className="text-sm text-white">Upload logo</Text>
                    <Text className="text-xs text-canvas-muted">Recommended 512x512</Text>
                  </View>
                )}
                {businessLogoUri && (
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      setBusinessLogoUri(null);
                    }}
                    className="absolute right-3 top-3 h-7 w-7 items-center justify-center rounded-full bg-black/70">
                    <Ionicons name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            </View>

            <View className="mb-8">
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-xs uppercase tracking-wider text-canvas-muted">
                  Showcase Images (Optional)
                </Text>
                <Text className="text-xs text-canvas-muted">{showcaseImages.length}/10</Text>
              </View>

              <TouchableOpacity
                onPress={pickShowcaseImages}
                className="mb-4 flex-row items-center justify-center gap-2 rounded-2xl border border-dashed border-canvas-border bg-canvas-surface py-4">
                <MaterialCommunityIcons name="image-multiple" size={20} color="#6366F1" />
                <Text className="text-sm font-medium text-indigo-400">Add Showcase Images</Text>
              </TouchableOpacity>

              {showcaseImages.length > 0 && (
                <View className="flex-row flex-wrap gap-3">
                  {showcaseImages.map((uri, index) => (
                    <View key={index} className="relative h-24 w-24 overflow-hidden rounded-2xl">
                      <Image source={{ uri }} className="h-full w-full" resizeMode="cover" />
                      <TouchableOpacity
                        onPress={() => removeShowcaseImage(index)}
                        className="absolute right-1.5 top-1.5 h-6 w-6 items-center justify-center rounded-full bg-black/70">
                        <Ionicons name="close" size={14} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

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
              name="businessCategory"
              render={({ field: { onChange } }) => (
                <Field label="Business Category" error={errors.businessCategory?.message}>
                  <View className="flex-row flex-wrap gap-2 pt-1">
                    {CATEGORIES.map((cat) => {
                      const isSelected = selectedCategory === cat.id;
                      return (
                        <TouchableOpacity
                          key={cat.id}
                          onPress={() => onChange(cat.id)}
                          className={`flex-row items-center gap-2 rounded-2xl border px-4 py-3 ${
                            isSelected
                              ? 'border-indigo-500 bg-indigo-900/60'
                              : 'border-canvas-border bg-canvas-surface'
                          }`}>
                          <Ionicons
                            name={cat.icon as any}
                            size={18}
                            color={isSelected ? '#6366F1' : '#8892A4'}
                          />
                          <Text
                            className={`text-sm font-medium ${
                              isSelected ? 'text-white' : 'text-canvas-muted'
                            }`}>
                            {cat.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
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
                <Field label="Business Phone Number" error={errors.businessPhoneNumber?.message}>
                  <StyledInput
                    value={value ?? ''}
                    onChangeText={onChange}
                    placeholder="08012345678"
                    keyboardType="phone-pad"
                    hasError={!!errors.businessPhoneNumber}
                  />
                </Field>
              )}
            />
          </Animated.View>
        </ScrollView>

        <Animated.View
          entering={FadeInUp.delay(200)}
          className="border-t border-canvas-border bg-canvas px-5 pb-8 pt-3">
          <Button
            label="Save Changes"
            onPress={handleSubmit(onSubmit)}
            loading={isUpdating}
            disabled={isUpdating}
          />
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
