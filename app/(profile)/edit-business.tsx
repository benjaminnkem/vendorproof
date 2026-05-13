import { Button } from '@/components/onboarding/shared';
import { showToast } from '@/lib/config/toast';
import useUser from '@/lib/hooks/use-user';
import {
  addBankDetails,
  removeBusinessBankDetails,
  updateBankDetails,
  updateBusinessProfile,
} from '@/lib/services/business-api';
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
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeOutDown,
  LinearTransition,
} from 'react-native-reanimated';
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

const bankSchema = z.object({
  bankName: z.string().min(2, 'Bank name is required'),
  accountNumber: z.string().length(10, 'Account number must be 10 digits'),
  accountName: z.string().min(2, 'Account name is required'),
  isPrimary: z.boolean(),
});

type FormValues = z.infer<typeof schema>;
type BankFormValues = z.infer<typeof bankSchema>;

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
  editable = true,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
  multiline?: boolean;
  hasError?: boolean;
  editable?: boolean;
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
      editable={editable}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className={`rounded-xl border bg-canvas-surface px-4 py-3.5 text-sm text-white ${
        !editable
          ? 'border-canvas-border opacity-50'
          : hasError
            ? 'border-alert-700'
            : focused
              ? 'border-indigo-500/60'
              : 'border-canvas-border'
      }`}
      style={multiline ? { textAlignVertical: 'top', minHeight: 100 } : {}}
    />
  );
}

function BankDetailsModal({
  visible,
  onClose,
  onSave,
  isSaving,
  existing,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (values: BankFormValues) => void;
  isSaving: boolean;
  existing?: (BankFormValues & { id: number }) | null;
}) {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BankFormValues>({
    resolver: zodResolver(bankSchema),
    defaultValues: {
      bankName: existing?.bankName ?? '',
      accountNumber: existing?.accountNumber ?? '',
      accountName: existing?.accountName ?? '',
      isPrimary: existing?.isPrimary ?? false,
    },
  });

  useEffect(() => {
    if (visible) {
      reset({
        bankName: existing?.bankName ?? '',
        accountNumber: existing?.accountNumber ?? '',
        accountName: existing?.accountName ?? '',
        isPrimary: existing?.isPrimary ?? false,
      });
    }
  }, [visible, existing]);

  const isPrimary = watch('isPrimary');

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/60">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View className="rounded-t-3xl border-t border-canvas-border bg-canvas px-5 pb-10 pt-5">
            <View className="mb-5 flex-row items-center justify-between">
              <Text className="text-base font-semibold text-white">
                {existing ? 'Edit bank account' : 'Add bank account'}
              </Text>
              <TouchableOpacity
                onPress={onClose}
                className="h-8 w-8 items-center justify-center rounded-full border border-canvas-border bg-canvas-surface">
                <Ionicons name="close" size={16} color="#8892A4" />
              </TouchableOpacity>
            </View>

            <Controller
              control={control}
              name="bankName"
              render={({ field: { value, onChange } }) => (
                <Field label="Bank name" required error={errors.bankName?.message}>
                  <StyledInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="e.g. GTBank, Access Bank, etc"
                    hasError={!!errors.bankName}
                  />
                </Field>
              )}
            />

            <Controller
              control={control}
              name="accountNumber"
              render={({ field: { value, onChange } }) => (
                <Field label="Account number" required error={errors.accountNumber?.message}>
                  <StyledInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="10-digit NUBAN"
                    keyboardType="numeric"
                    hasError={!!errors.accountNumber}
                  />
                </Field>
              )}
            />

            <Controller
              control={control}
              name="accountName"
              render={({ field: { value, onChange } }) => (
                <Field label="Account name" required error={errors.accountName?.message}>
                  <StyledInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="As registered with your bank"
                    hasError={!!errors.accountName}
                  />
                </Field>
              )}
            />

            <TouchableOpacity
              onPress={() => setValue('isPrimary', !isPrimary)}
              className="mb-6 flex-row items-center gap-3">
              <View
                className={`h-5 w-5 items-center justify-center rounded-md border ${
                  isPrimary
                    ? 'border-indigo-500 bg-indigo-500'
                    : 'border-canvas-border bg-canvas-surface'
                }`}>
                {isPrimary && <Ionicons name="checkmark" size={13} color="#fff" />}
              </View>
              <Text className="text-sm text-white">Set as primary account</Text>
            </TouchableOpacity>

            <Button
              label={existing ? 'Save changes' : 'Add bank account'}
              onPress={handleSubmit(onSave)}
              loading={isSaving}
              disabled={isSaving}
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

function BankCard({
  bank,
  onEdit,
  onRemove,
  isRemoving,
}: {
  bank: BankFormValues & { id: number };
  onEdit: () => void;
  onRemove: () => void;
  isRemoving: boolean;
}) {
  return (
    <Animated.View
      entering={FadeInDown.springify()}
      exiting={FadeOutDown.duration(200)}
      layout={LinearTransition.springify()}
      className="overflow-hidden rounded-2xl border border-canvas-border bg-canvas-surface">
      <View className="flex-row items-start gap-3 px-4 py-4">
        <View className="h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-900/40">
          <Ionicons name="card-outline" size={18} color="#7B8FF7" />
        </View>

        <View className="flex-1">
          <View className="mb-0.5 flex-row items-center gap-2">
            <Text className="text-sm font-semibold text-white">{bank.bankName}</Text>
            {bank.isPrimary && (
              <View className="rounded-full border border-indigo-500/30 bg-indigo-900/60 px-2 py-0.5">
                <Text className="text-xs text-indigo-300">Primary</Text>
              </View>
            )}
          </View>
          <Text className="mb-0.5 text-xs text-canvas-muted">
            ••••••{bank.accountNumber.slice(-4)}
          </Text>
          <Text className="text-xs text-canvas-muted">{bank.accountName}</Text>
        </View>

        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            onPress={onEdit}
            className="h-8 w-8 items-center justify-center rounded-xl border border-canvas-border bg-canvas-elevated">
            <Ionicons name="create-outline" size={14} color="#8892A4" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onRemove}
            disabled={isRemoving}
            className="h-8 w-8 items-center justify-center rounded-xl border border-alert-900/60 bg-alert-900/30">
            <Ionicons name="trash-outline" size={14} color="#E63946" />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

export default function EditBusinessScreen() {
  const router = useRouter();
  const { user, refetch } = useUser();
  const { accessToken } = useAuthStore();
  const business = user?.business;

  const [businessLogoUri, setBusinessLogoUri] = useState<string | null>(null);
  const [showcaseImages, setShowcaseImages] = useState<string[]>([]);
  const [bankModalVisible, setBankModalVisible] = useState(false);
  const [editingBank, setEditingBank] = useState<(BankFormValues & { id: number }) | null>(null);

  const banks = user?.business?.bankDetails || [];

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      businessName: business?.name || '',
      businessDescription: business?.description || '',
      businessPhoneNumber: business?.phoneNumber || '',
      businessCategory: business?.category || '',
    },
  });

  const selectedCategory = watch('businessCategory');

  const { mutate: updateProfile, isPending: isUpdating } = useMutation({
    mutationFn: (payload: { payload: FormData; accessToken: string }) =>
      updateBusinessProfile(payload),
  });

  const { mutate: addBankMutate, isPending: isAddingBank } = useMutation({
    mutationFn: addBankDetails,
  });

  const { mutate: updateBankMutate, isPending: isUpdatingBank } = useMutation({
    mutationFn: updateBankDetails,
  });

  const { mutate: removeBankMutate, isPending: isRemovingBank } = useMutation({
    mutationFn: removeBusinessBankDetails,
  });

  useEffect(() => {
    if (business) {
      reset({
        businessName: business.name || '',
        businessDescription: business.description || '',
        businessPhoneNumber: business.phoneNumber || '',
        businessCategory: business.category || '',
      });
      if (business.logo) setBusinessLogoUri(business.logo);
      if (business.showcaseImages?.length) setShowcaseImages(business.showcaseImages);
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

  const handleBankSave = (values: BankFormValues) => {
    if (editingBank) {
      updateBankMutate(
        { id: editingBank.id, payload: values },
        {
          onSuccess: () => {
            showToast.success('Bank account updated');
            setBankModalVisible(false);
            setEditingBank(null);
            refetch();
          },
          onError: (e: any) => showToast.error(e?.message || 'Failed to update bank account'),
        }
      );
    } else {
      addBankMutate(values as any, {
        onSuccess: () => {
          showToast.success('Bank account added');
          setBankModalVisible(false);
          refetch();
        },
        onError: (e: any) => {
          showToast.error(e?.message || 'Failed to add bank account');
        },
      });
    }
  };

  const handleRemoveBank = (id: number) => {
    Alert.alert('Remove bank account', 'Are you sure you want to remove this account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          removeBankMutate(id, {
            onSuccess: () => {
              showToast.success('Bank account removed');
              refetch();
            },
            onError: (e: any) => showToast.error(e?.message || 'Failed to remove bank account'),
          });
        },
      },
    ]);
  };

  const onSubmit = (values: FormValues) => {
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

    updateProfile(
      { payload: formData, accessToken: accessToken || '' },
      {
        onSuccess: () => {
          showToast.success('Business profile updated');
          refetch();
          router.back();
        },
        onError: (e: any) => showToast.error(e?.message || 'Failed to update business profile'),
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

            <SectionLabel>Bank Accounts</SectionLabel>

            <View className="gap-3">
              {banks.length === 0 ? (
                <View className="items-center rounded-2xl border border-dashed border-canvas-border bg-canvas-surface px-4 py-6">
                  <View className="mb-3 h-12 w-12 items-center justify-center rounded-2xl bg-canvas-elevated">
                    <Ionicons name="card-outline" size={22} color="#8892A4" />
                  </View>
                  <Text className="mb-1 text-sm font-medium text-white">No bank accounts yet</Text>
                  <Text className="text-center text-xs leading-relaxed text-canvas-muted">
                    Add a bank account to receive Squad payouts
                  </Text>
                </View>
              ) : (
                banks.map((bank) => (
                  <BankCard
                    key={bank.id}
                    bank={bank}
                    onEdit={() => {
                      setEditingBank(bank);
                      setBankModalVisible(true);
                    }}
                    onRemove={() => handleRemoveBank(bank.id)}
                    isRemoving={isRemovingBank}
                  />
                ))
              )}

              <TouchableOpacity
                onPress={() => {
                  setEditingBank(null);
                  setBankModalVisible(true);
                }}
                className="flex-row items-center justify-center gap-2 rounded-2xl border border-dashed border-indigo-500/40 bg-indigo-900/20 py-4">
                <Ionicons name="add-circle-outline" size={18} color="#7B8FF7" />
                <Text className="text-sm font-medium text-indigo-300">Add bank account</Text>
              </TouchableOpacity>
            </View>
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

      <BankDetailsModal
        visible={bankModalVisible}
        onClose={() => {
          setBankModalVisible(false);
          setEditingBank(null);
        }}
        onSave={handleBankSave}
        isSaving={isAddingBank || isUpdatingBank}
        existing={editingBank}
      />
    </SafeAreaView>
  );
}
