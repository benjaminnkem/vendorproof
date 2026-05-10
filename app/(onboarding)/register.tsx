import { Button, Card, StepIndicator } from '@/components/onboarding/shared';
import { useRegisterVendor } from '@/lib/hooks/use-onboarding';
import { useOnboardingStore } from '@/lib/store/onboarding.store';
import { registrationSchema, type RegistrationFormData } from '@/lib/validators';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// type Category = {
//   id: RegistrationFormData['category'];
//   label: string;
//   icon: React.ReactNode;
// };

// const CATEGORIES: Category[] = [
//   {
//     id: 'electronics',
//     label: 'Electronics',
//     icon: <Ionicons name="phone-portrait-outline" size={18} color="white" />,
//   },
//   {
//     id: 'fashion',
//     label: 'Fashion',
//     icon: <Ionicons name="shirt-outline" size={18} color="white" />,
//   },
//   {
//     id: 'food',
//     label: 'Food & Drinks',
//     icon: <Ionicons name="restaurant-outline" size={18} color="white" />,
//   },
//   {
//     id: 'logistics',
//     label: 'Logistics',
//     icon: <Ionicons name="train-outline" size={18} color="white" />,
//   },
//   {
//     id: 'beauty',
//     label: 'Beauty',
//     icon: <Ionicons name="sparkles-outline" size={18} color="white" />,
//   },
//   {
//     id: 'services',
//     label: 'Services',
//     icon: <Ionicons name="construct-outline" size={18} color="white" />,
//   },
//   {
//     id: 'groceries',
//     label: 'Groceries',
//     icon: <Ionicons name="cart-outline" size={18} color="white" />,
//   },
//   {
//     id: 'other',
//     label: 'Other',
//     icon: <Ionicons name="cube-outline" size={18} color="white" />,
//   },
// ];

export default function RegisterScreen() {
  const router = useRouter();
  const updateData = useOnboardingStore((s) => s.updateData);
  const setStep = useOnboardingStore((s) => s.setStep);
  const { mutateAsync: registerVendor, isPending } = useRegisterVendor();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    setStep(1);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 450, useNativeDriver: true }),
    ]).start();
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
    },
  });

  const onSubmit = async (values: RegistrationFormData) => {
    try {
      await registerVendor({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phoneNumber: values.phoneNumber,
      });
      updateData({ ...values });
      router.push('/(onboarding)/verify');
    } catch (e) {
      console.error('Register error', e);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View className="mb-8 mt-4 flex-row items-center justify-between">
              <TouchableOpacity
                onPress={() => router.back()}
                className="h-10 w-10 items-center justify-center rounded-full border border-canvas-border bg-canvas-surface">
                <Ionicons name="chevron-back" size={22} color="#fff" />
              </TouchableOpacity>
              <StepIndicator total={4} current={0} />
              <View className="w-10" />
            </View>

            <Text className="mb-2 text-xs uppercase tracking-widest text-canvas-muted">
              Step 1 of 4
            </Text>
            <Text className="mb-2 text-3xl font-semibold leading-tight text-white">
              Your business{'\n'}
              <Text className="text-indigo-400">profile</Text>
            </Text>
            <Text className="mb-8 text-sm leading-relaxed text-canvas-muted">
              This information will appear on your Trust Badge. Make sure it matches your ID.
            </Text>
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim }}>
            <View className="mb-5">
              <Text className="mb-2 text-xs uppercase tracking-widest text-canvas-muted">
                First name
              </Text>
              <Controller
                control={control}
                name="firstName"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="Chinedu"
                    placeholderTextColor="#8892A4"
                    className={`rounded-xl border bg-canvas-surface px-4 py-4 text-base text-white ${
                      errors.firstName ? 'border-alert-500' : 'border-canvas-border'
                    }`}
                  />
                )}
              />
              {errors.firstName && (
                <Text className="mt-1.5 text-xs text-alert-300">{errors.firstName.message}</Text>
              )}
            </View>

            <View className="mb-5">
              <Text className="mb-2 text-xs uppercase tracking-widest text-canvas-muted">
                Last name
              </Text>
              <Controller
                control={control}
                name="lastName"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="Okafor"
                    placeholderTextColor="#8892A4"
                    className={`rounded-xl border bg-canvas-surface px-4 py-4 text-base text-white ${
                      errors.lastName ? 'border-alert-500' : 'border-canvas-border'
                    }`}
                  />
                )}
              />
              {errors.lastName && (
                <Text className="mt-1.5 text-xs text-alert-300">{errors.lastName.message}</Text>
              )}
            </View>

            <Controller
              control={control}
              name="phoneNumber"
              render={({ field: { onChange, value } }) => (
                <View className="mb-5">
                  <Text className="mb-2 text-xs uppercase tracking-widest text-canvas-muted">
                    Phone number
                  </Text>
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="08012345678"
                    placeholderTextColor="#8892A4"
                    keyboardType="phone-pad"
                    className={`rounded-xl border bg-canvas-surface px-4 py-4 text-base text-white ${
                      errors.phoneNumber ? 'border-alert-500' : 'border-canvas-border'
                    }`}
                  />
                  {errors.phoneNumber && (
                    <Text className="mt-1.5 text-xs text-alert-300">
                      {errors.phoneNumber.message}
                    </Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <View className="mb-5">
                  <Text className="mb-2 text-xs uppercase tracking-widest text-canvas-muted">
                    Email address (optional)
                  </Text>
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="chinedu@gmail.com"
                    placeholderTextColor="#8892A4"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className={`rounded-xl border bg-canvas-surface px-4 py-4 text-base text-white ${
                      errors.email ? 'border-alert-500' : 'border-canvas-border'
                    }`}
                  />
                  {errors.email && (
                    <Text className="mt-1.5 text-xs text-alert-300">{errors.email.message}</Text>
                  )}
                </View>
              )}
            />

            {/* <Controller
              control={control}
              name="businessName"
              render={({ field: { onChange, value } }) => (
                <View className="mb-6">
                  <Text className="mb-2 text-xs uppercase tracking-widest text-canvas-muted">
                    Business name
                  </Text>
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="e.g. Chinedu Electronics"
                    placeholderTextColor="#8892A4"
                    autoCapitalize="words"
                    className={`rounded-xl border bg-canvas-surface px-4 py-4 text-base text-white ${
                      errors.businessName ? 'border-alert-500' : 'border-canvas-border'
                    }`}
                  />
                  {errors.businessName && (
                    <Text className="mt-1.5 text-xs text-alert-300">
                      {errors.businessName.message}
                    </Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="category"
              render={({ field: { onChange, value } }) => (
                <View className="mb-8">
                  <Text className="mb-3 text-xs uppercase tracking-widest text-canvas-muted">
                    Business category
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {CATEGORIES.map((cat) => {
                      const isSelected = value === cat.id;
                      return (
                        <TouchableOpacity
                          key={cat.id}
                          onPress={() => onChange(cat.id)}
                          className={`flex-row items-center gap-2 rounded-xl border px-3 py-2.5 ${
                            isSelected
                              ? 'border-indigo-500 bg-indigo-900'
                              : 'border-canvas-border bg-canvas-surface'
                          }`}>
                          {cat.icon}
                          <Text
                            className={`text-sm font-medium ${
                              isSelected ? 'text-indigo-200' : 'text-canvas-muted'
                            }`}>
                            {cat.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  {errors.category && (
                    <Text className="mt-1.5 text-xs text-alert-300">{errors.category.message}</Text>
                  )}
                </View>
              )}
            /> */}

            <Button label="Continue →" onPress={handleSubmit(onSubmit)} loading={isPending} />

            <Card className="mt-4">
              <View className="flex-row items-start gap-3">
                <Ionicons name="card-outline" size={24} color="#60A5FA" />
                <View className="flex-1">
                  <Text className="mb-1 text-sm font-medium text-white">₦500 verification fee</Text>
                  <Text className="text-xs leading-relaxed text-canvas-muted">
                    A one-time fee collected via Squad to activate your Trust Badge. Refundable if
                    verification fails.
                  </Text>
                </View>
              </View>
            </Card>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
