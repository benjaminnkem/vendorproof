import useUser from '@/lib/hooks/use-user';
import { addBusinessSocialLink, removeBusinessSocialLink } from '@/lib/services/business-api';
import { MOCK_VENDOR, TIER_CONFIG } from '@/lib/types/dashboard';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const SOCIAL_PLATFORMS = [
  { key: 'INSTAGRAM', label: 'Instagram', icon: 'logo-instagram' as const, color: '#E1306C' },
  { key: 'TWITTER', label: 'X (Twitter)', icon: 'logo-twitter' as const, color: '#1DA1F2' },
  { key: 'FACEBOOK', label: 'Facebook', icon: 'logo-facebook' as const, color: '#1877F2' },
  { key: 'LINKEDIN', label: 'LinkedIn', icon: 'logo-linkedin' as const, color: '#0A66C2' },
  { key: 'TIKTOK', label: 'TikTok', icon: 'logo-tiktok' as const, color: '#000000' },
  { key: 'YOUTUBE', label: 'YouTube', icon: 'logo-youtube' as const, color: '#FF0000' },
  { key: 'WEBSITE', label: 'Website', icon: 'globe-outline' as const, color: '#22C55E' },
  { key: 'OTHER', label: 'Other', icon: 'link-outline' as const, color: '#8892A4' },
];

function SectionHead({ title, onEdit }: { title: string; onEdit?: () => void }) {
  return (
    <View className="mb-3 flex-row items-center justify-between">
      <Text className="text-sm font-semibold text-white">{title}</Text>
      {onEdit && (
        <TouchableOpacity
          onPress={onEdit}
          className="flex-row items-center gap-1 rounded-full bg-canvas-surface px-3 py-1.5 active:bg-canvas-elevated">
          <Ionicons name="create-outline" size={14} color="#8892A4" />
          <Text className="text-xs font-medium text-canvas-muted">Edit</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function DetailRow({
  icon,
  label,
  value,
  last = false,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  last?: boolean;
}) {
  return (
    <View
      className={`flex-row items-center gap-3 px-4 py-3.5 ${!last ? 'border-b border-canvas-border' : ''}`}>
      <View className="h-8 w-8 items-center justify-center rounded-xl bg-canvas-elevated">
        {icon}
      </View>
      <View className="flex-1">
        <Text className="mb-0.5 text-xs text-canvas-muted">{label}</Text>
        <Text className="text-sm font-medium text-white">{value ?? '—'}</Text>
      </View>
    </View>
  );
}

function BusinessHeader() {
  const { user } = useUser();
  const v = MOCK_VENDOR;
  const tc = TIER_CONFIG[v.tier];

  const business = user?.business;

  return (
    <Animated.View entering={FadeInDown.delay(60)} className="mb-6">
      <View className="overflow-hidden rounded-3xl border border-canvas-border bg-canvas-surface">
        <View className="p-5">
          <View className="mb-4 flex-row items-start gap-4">
            <View className="h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-canvas-border bg-canvas-elevated">
              {business?.logo ? (
                <Image source={{ uri: business.logo }} className="h-full w-full" />
              ) : (
                <Ionicons name="storefront-outline" size={26} color="#8892A4" />
              )}
            </View>

            <View className="flex-1 pt-1">
              <Text className="mb-1 text-lg font-semibold text-white">
                {business?.name ?? v.category}
              </Text>
              <View
                className="mb-2 flex-row items-center gap-1.5 self-start rounded-full border px-2.5 py-1"
                style={{ backgroundColor: tc.bg, borderColor: tc.color + '50' }}>
                <MaterialCommunityIcons name="shield-check" size={11} color={tc.color} />
                <Text className="text-xs font-semibold" style={{ color: tc.color }}>
                  {tc.label} · Score {v.trustScore}
                </Text>
              </View>
              <Text className="text-xs text-canvas-muted">{v.category}</Text>
            </View>
          </View>

          <View className="rounded-xl border border-canvas-border bg-canvas-elevated px-4 py-3">
            <Text className="text-xs leading-relaxed text-canvas-muted">
              Quality electronics at the best prices on Lagos Island. Trusted by 140+ customers
              across Lagos. We sell and repair phones, laptops, accessories and more.
            </Text>
          </View>
        </View>

        <View className="flex-row border-t border-canvas-border">
          {[
            { label: 'Member since', value: v.joinDate },
            { label: 'Location', value: 'Lagos Island' },
            { label: 'Orders', value: `${v.totalTransactions}` },
          ].map(({ label, value }, i) => (
            <View
              key={label}
              className={`flex-1 items-center py-3 ${i < 2 ? 'border-r border-canvas-border' : ''}`}>
              <Text className="mb-0.5 text-xs text-canvas-muted">{label}</Text>
              <Text className="text-xs font-semibold text-white">{value}</Text>
            </View>
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

function ContactSection() {
  const { user } = useUser();

  return (
    <Animated.View entering={FadeInDown.delay(140)} className="mb-5">
      <SectionHead title="Contact" />
      <View className="overflow-hidden rounded-3xl border border-canvas-border bg-canvas-surface">
        <DetailRow
          icon={<Ionicons name="call-outline" size={15} color="#7B8FF7" />}
          label="Business phone"
          value={user?.phoneNumber}
        />
        <DetailRow
          icon={<Ionicons name="mail-outline" size={15} color="#7B8FF7" />}
          label="Business email"
          value={user?.email ?? undefined}
        />
        <DetailRow
          icon={<Ionicons name="location-outline" size={15} color="#7B8FF7" />}
          label="Location"
          value="Lagos Island, Lagos"
          last
        />
      </View>
    </Animated.View>
  );
}

function SocialsSection({
  onAddPress,
  onEditPress,
  onRemove,
}: {
  onAddPress: () => void;
  onEditPress: (social: any) => void;
  onRemove: (id: number) => void;
}) {
  const { user } = useUser();
  const socials = user?.business?.socials || [];

  return (
    <Animated.View entering={FadeInDown.delay(200)} className="mb-5">
      <SectionHead title="Socials" onEdit={onAddPress} />

      <View className="overflow-hidden rounded-3xl border border-canvas-border bg-canvas-surface">
        {socials.length > 0 ? (
          socials.map((social, i) => {
            const plat = SOCIAL_PLATFORMS.find((p) => p.key === social.platform);
            return (
              <TouchableOpacity
                key={social.id || i}
                onPress={() => onEditPress(social)}
                className={`flex-row items-center gap-3 px-4 py-3.5 ${i < socials.length - 1 ? 'border-b border-canvas-border' : ''}`}>
                <View className="h-8 w-8 items-center justify-center rounded-xl bg-canvas-elevated">
                  <Ionicons
                    name={plat?.icon || 'link-outline'}
                    size={18}
                    color={plat?.color || '#8892A4'}
                  />
                </View>
                <View className="flex-1">
                  <Text className="mb-0.5 text-xs text-canvas-muted">
                    {plat?.label || social.platform}
                  </Text>
                  <Text className="text-sm font-medium text-white">{social.url}</Text>
                </View>
                <Ionicons name="open-outline" size={16} color="#8892A4" />
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    onRemove(social.id);
                  }}
                  className="p-2">
                  <Ionicons name="trash-outline" size={18} color="#f87171" />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })
        ) : (
          <View className="flex-row items-center justify-center px-4 py-10">
            <Text className="text-sm font-medium text-white">No social links added</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

function BankSection() {
  const { user } = useUser();
  const banks = user?.business?.bankDetails || [];

  const primaryBank = banks.find((b) => b.isPrimary);

  return (
    <Animated.View entering={FadeInDown.delay(260)} className="mb-5">
      <SectionHead title="Bank details" />
      <View className="overflow-hidden rounded-3xl border border-canvas-border bg-canvas-surface">
        <DetailRow
          icon={<Ionicons name="business-outline" size={15} color="#7B8FF7" />}
          label="Bank"
          value={primaryBank?.bankName ?? '—'}
        />
        <DetailRow
          icon={<Ionicons name="card-outline" size={15} color="#7B8FF7" />}
          label="Account number"
          value={primaryBank?.accountNumber ?? '—'}
        />
        <DetailRow
          icon={<Ionicons name="person-outline" size={15} color="#7B8FF7" />}
          label="Account name"
          value={primaryBank?.accountName ?? '—'}
          last
        />
      </View>
    </Animated.View>
  );
}

function VerificationSection() {
  return (
    <Animated.View entering={FadeInDown.delay(320)} className="mb-5">
      <SectionHead title="Business verification" />
      <View className="overflow-hidden rounded-3xl border border-canvas-border bg-canvas-surface">
        <View className="flex-row items-center gap-3 border-b border-canvas-border px-4 py-3.5">
          <View className="h-8 w-8 items-center justify-center rounded-xl bg-teal-900/60">
            <MaterialCommunityIcons name="file-certificate-outline" size={15} color="#20C997" />
          </View>
          <View className="flex-1">
            <Text className="mb-0.5 text-xs text-canvas-muted">CAC Certificate</Text>
            <Text className="text-sm font-medium text-white">Uploaded & verified</Text>
          </View>
          <View className="flex-row items-center gap-1.5 rounded-full border border-teal-700/40 bg-teal-900/60 px-2.5 py-1">
            <View className="h-1.5 w-1.5 rounded-full bg-teal-400" />
            <Text className="text-xs font-medium text-teal-300">Verified</Text>
          </View>
        </View>

        <View className="flex-row items-center gap-3 px-4 py-3.5">
          <View className="h-8 w-8 items-center justify-center rounded-xl bg-canvas-elevated">
            <MaterialCommunityIcons name="identifier" size={15} color="#7B8FF7" />
          </View>
          <View className="flex-1">
            <Text className="mb-0.5 text-xs text-canvas-muted">TIN Number</Text>
            <Text className="text-sm font-medium text-white">••••••789</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

function ShowcaseSection() {
  const { user } = useUser();
  const images = user?.business?.showCaseImages || [];

  return (
    <Animated.View entering={FadeInDown.delay(380)} className="mb-5">
      <SectionHead title="Showcase" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10 }}>
        {images.map((uri, i) => (
          <Animated.View key={uri} entering={FadeInRight.delay(380 + i * 60)}>
            <View className="overflow-hidden rounded-2xl border border-canvas-border">
              <Image source={{ uri }} style={{ width: 140, height: 110 }} resizeMode="cover" />
            </View>
          </Animated.View>
        ))}

        <TouchableOpacity className="h-[110px] w-24 items-center justify-center rounded-2xl border-2 border-dashed border-canvas-border bg-canvas-surface">
          <Ionicons name="add" size={22} color="#8892A4" />
          <Text className="mt-1 text-xs text-canvas-muted">Add</Text>
        </TouchableOpacity>
      </ScrollView>
      <Text className="mt-2 text-xs text-canvas-muted">{images.length} of 10 showcase images</Text>
    </Animated.View>
  );
}

export default function BusinessProfileDetailScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const bottomSheetRef = useRef<BottomSheet>(null);

  const [selectedPlatform, setSelectedPlatform] = useState<(typeof SOCIAL_PLATFORMS)[0] | null>(
    null
  );
  const [url, setUrl] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  const addMutation = useMutation({
    mutationFn: addBusinessSocialLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      resetSheet();
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeBusinessSocialLink,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user'] }),
  });

  const snapPoints = useMemo(() => ['48%'], []);

  const openAddSheet = useCallback(() => {
    setSelectedPlatform(null);
    setUrl('');
    setEditingId(null);
    bottomSheetRef.current?.expand();
  }, []);

  const openEditSheet = useCallback((social: any) => {
    const platformData = SOCIAL_PLATFORMS.find((p) => p.key === social.platform);
    if (platformData) {
      setSelectedPlatform(platformData);
      setUrl(social.url || '');
      setEditingId(social.id);
      bottomSheetRef.current?.expand();
    }
  }, []);

  const resetSheet = useCallback(() => {
    setSelectedPlatform(null);
    setUrl('');
    setEditingId(null);
    bottomSheetRef.current?.close();
  }, []);

  const handleSubmit = useCallback(() => {
    if (!selectedPlatform || !url.trim()) return;

    addMutation.mutate({
      platform: selectedPlatform.key,
      url: url.trim(),
    });
  }, [selectedPlatform, url, addMutation]);

  const handleRemove = useCallback(
    (id: number) => {
      removeMutation.mutate(id);
    },
    [removeMutation]
  );

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <Animated.View
        entering={FadeInDown.delay(0)}
        className="flex-row items-center justify-between border-b border-canvas-border px-5 pb-3 pt-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full border border-canvas-border bg-canvas-surface">
          <Ionicons name="arrow-back" size={18} color="#8892A4" />
        </TouchableOpacity>

        <Text className="text-sm font-semibold text-white">Business Profile</Text>

        <TouchableOpacity
          onPress={() => router.push('/(profile)/edit-business')}
          className="h-10 w-10 items-center justify-center rounded-full border border-canvas-border bg-canvas-surface">
          <Feather name="edit-2" size={15} color="#8892A4" />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}>
        <BusinessHeader />
        <ContactSection />
        <SocialsSection
          onAddPress={openAddSheet}
          onEditPress={openEditSheet}
          onRemove={handleRemove}
        />
        <BankSection />
        <VerificationSection />
        <ShowcaseSection />
      </ScrollView>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={BottomSheetBackdrop}
        backgroundStyle={{ backgroundColor: '#1A1F2E' }}
        handleIndicatorStyle={{ backgroundColor: '#8892A4' }}>
        <BottomSheetView className="px-6 pb-8">
          <Text className="mb-6 text-center text-lg font-semibold text-white">
            {editingId !== null ? 'Edit Social Link' : 'Add Social Link'}
          </Text>

          <Text className="mb-3 text-sm font-medium text-canvas-muted">Platform</Text>
          <View className="mb-6 flex-row flex-wrap gap-3">
            {SOCIAL_PLATFORMS.map((plat) => (
              <TouchableOpacity
                key={plat.key}
                onPress={() => setSelectedPlatform(plat)}
                className={`flex-row items-center gap-2 rounded-2xl border px-4 py-3 ${
                  selectedPlatform?.key === plat.key
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-canvas-border bg-canvas-elevated'
                }`}>
                <Ionicons name={plat.icon} size={20} color={plat.color} />
                <Text className="font-medium text-white">{plat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedPlatform && (
            <>
              <Text className="mb-3 text-sm font-medium text-canvas-muted">URL</Text>
              <View className="mb-6 rounded-2xl border border-canvas-border bg-canvas-elevated px-4">
                <TextInput
                  className="flex-1 py-4 text-white"
                  placeholder="https://example.com"
                  value={url}
                  onChangeText={setUrl}
                  autoCapitalize="none"
                  keyboardType="url"
                  autoCorrect={false}
                />
              </View>
            </>
          )}

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!selectedPlatform || !url.trim() || addMutation.isPending}
            className="mt-2 rounded-2xl bg-white py-4 active:opacity-90 disabled:opacity-60">
            <Text className="text-center font-semibold text-black">
              {addMutation.isPending ? 'Saving...' : editingId ? 'Update Link' : 'Add Link'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={resetSheet} className="mt-4 py-3">
            <Text className="text-center text-sm font-medium text-canvas-muted">Cancel</Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  );
}
