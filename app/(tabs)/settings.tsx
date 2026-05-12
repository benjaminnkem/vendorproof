import { storage } from '@/lib/config/storage';
import useUser from '@/lib/hooks/use-user';
import { useAuthStore } from '@/lib/store/auth.store';
import { useOnboardingStore } from '@/lib/store/onboarding.store';
import { MOCK_VENDOR, TIER_CONFIG } from '@/lib/types/dashboard';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

function ToggleSwitch({
  value,
  onChange,
  color = '#4361EE',
  disabled,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  color?: string;
  disabled?: boolean;
}) {
  const translateX = useSharedValue(value ? 20 : 2);

  const handleChange = (next: boolean) => {
    translateX.value = withSpring(next ? 20 : 2, { damping: 15, stiffness: 300 });
    onChange(next);
  };

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <TouchableOpacity
      onPress={() => handleChange(!value)}
      disabled={disabled}
      className={`h-7 w-12 justify-center rounded-full border ${
        value ? 'border-transparent' : 'border-canvas-border bg-canvas-elevated'
      } disabled:opacity-20`}
      style={value ? { backgroundColor: color } : {}}
      activeOpacity={0.8}>
      <Animated.View style={thumbStyle} className="h-5 w-5 rounded-full bg-white shadow-sm" />
    </TouchableOpacity>
  );
}

function SettingRow({
  icon,
  label,
  desc,
  value,
  onToggle,
  onPress,
  danger = false,
  last = false,
  badge,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  desc?: string;
  value?: boolean;
  onToggle?: (v: boolean) => void;
  onPress?: () => void;
  danger?: boolean;
  last?: boolean;
  badge?: string;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={onPress ? 0.7 : 1}
      className={`flex-row items-center gap-3 px-4 py-4 ${!last ? 'border-b border-canvas-border' : ''}`}>
      <View
        className={`h-9 w-9 items-center justify-center rounded-xl ${
          danger
            ? 'border border-alert-700 bg-alert-900'
            : 'border border-canvas-border bg-canvas-elevated'
        }`}>
        {icon}
      </View>

      <View className="flex-1">
        <Text className={`text-sm font-medium ${danger ? 'text-alert-500' : 'text-white'}`}>
          {label}
        </Text>
        {desc && <Text className="mt-0.5 text-xs text-canvas-muted">{desc}</Text>}
      </View>

      {badge && (
        <View className="mr-2 rounded-full border border-indigo-500/40 bg-indigo-900 px-2 py-0.5">
          <Text className="text-xs text-indigo-300">{badge}</Text>
        </View>
      )}

      {onToggle !== undefined && value !== undefined ? (
        <ToggleSwitch value={value} onChange={onToggle} disabled={disabled} />
      ) : onPress ? (
        <Ionicons name="chevron-forward" size={16} color="#8892A4" />
      ) : null}
    </TouchableOpacity>
  );
}

function Section({
  title,
  children,
  delay = 0,
}: {
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(delay)} className="mb-5">
      <Text className="mb-2.5 px-1 text-xs uppercase tracking-widest text-canvas-muted">
        {title}
      </Text>
      <View className="overflow-hidden rounded-3xl border border-canvas-border bg-canvas-surface">
        {children}
      </View>
    </Animated.View>
  );
}

function AccountCard() {
  const v = MOCK_VENDOR;
  const tc = TIER_CONFIG[v.tier];

  const { user } = useUser();

  return (
    <Animated.View entering={FadeInDown.delay(60)} className="mb-5">
      <View className="overflow-hidden rounded-3xl border border-canvas-border bg-canvas-surface p-4">
        {/* bg glow */}
        <View
          className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-10"
          style={{ backgroundColor: tc.color }}
        />

        <View className="flex-row items-center gap-3">
          <View
            className="h-14 w-14 items-center justify-center rounded-full border-2"
            style={{ backgroundColor: tc.bg, borderColor: tc.color }}>
            <Text style={{ fontSize: 24 }}>👤</Text>
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-white">
              {user?.firstName} {user?.lastName}
            </Text>
            <Text className="mb-1.5 text-xs text-canvas-muted">{user?.phoneNumber}</Text>
            <View
              className="flex-row items-center gap-1.5 self-start rounded-full border px-2 py-0.5"
              style={{ backgroundColor: tc.bg, borderColor: tc.color + '50' }}>
              <MaterialCommunityIcons name="shield-check" size={10} color={tc.color} />
              <Text className="text-xs font-semibold" style={{ color: tc.color }}>
                {tc.label} · Score {v.trustScore}
              </Text>
            </View>
          </View>
          <TouchableOpacity className="rounded-xl border border-canvas-border bg-canvas-elevated px-3 py-2">
            <Text className="text-xs text-canvas-muted">Edit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

export default function SettingsScreen() {
  const [notifPayments, setNotifPayments] = useState(true);
  const [notifScore, setNotifScore] = useState(true);
  const [notifBadge, setNotifBadge] = useState(false);
  const [notifSMS, setNotifSMS] = useState(true);
  const [biometricAuth, setBiometricAuth] = useState(true);
  const [twoFA, setTwoFA] = useState(false);
  const [webhookSig, setWebhookSig] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [compactView, setCompactView] = useState(false);

  const { signOut } = useAuthStore();
  const { reset: resetOnboarding } = useOnboardingStore();

  const router = useRouter();

  const handleSignOut = async () => {
    await storage.clearAll();
    resetOnboarding();
    signOut();

    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(0)} className="mb-5 pt-4">
          <Text className="mb-1 text-xs uppercase tracking-widest text-canvas-muted">
            Preferences
          </Text>
          <Text className="text-2xl font-semibold text-white">Settings</Text>
        </Animated.View>

        <AccountCard />

        {/* Notifications */}
        <Section title="Notifications" delay={120}>
          <SettingRow
            icon={<Ionicons name="cash-outline" size={16} color="#20C997" />}
            label="Payment received"
            desc="Alert on every incoming Squad payment"
            value={notifPayments}
            onToggle={setNotifPayments}
          />
          <SettingRow
            icon={<MaterialCommunityIcons name="shield-check-outline" size={16} color="#4361EE" />}
            label="Score updates"
            desc="When your trust score changes"
            value={notifScore}
            onToggle={setNotifScore}
          />
          <SettingRow
            icon={<Ionicons name="ribbon-outline" size={16} color="#F0A500" />}
            label="Tier milestones"
            desc="Bronze → Silver → Gold → Platinum"
            value={notifBadge}
            onToggle={setNotifBadge}
          />
          <SettingRow
            icon={<Ionicons name="phone-portrait-outline" size={16} color="#8892A4" />}
            label="SMS alerts"
            desc="Via Termii to your registered number"
            value={notifSMS}
            onToggle={setNotifSMS}
            last
          />
        </Section>

        {/* Security */}
        <Section title="Security" delay={200}>
          <SettingRow
            icon={<Ionicons name="finger-print-outline" size={16} color="#4361EE" />}
            label="Biometric unlock"
            desc="Use Face ID or fingerprint"
            value={biometricAuth}
            onToggle={setBiometricAuth}
          />
          <SettingRow
            icon={
              <MaterialCommunityIcons name="two-factor-authentication" size={16} color="#20C997" />
            }
            label="Two-factor authentication"
            desc="OTP on login via SMS"
            value={twoFA}
            onToggle={setTwoFA}
            badge="Recommended"
          />
          {/* <SettingRow
            icon={<Feather name="key" size={16} color="#8892A4" />}
            label="Webhook signature"
            desc="Validate HMAC on Squad events"
            value={webhookSig}
            onToggle={setWebhookSig}
          /> */}
          <SettingRow
            icon={<Ionicons name="lock-closed-outline" size={16} color="#8892A4" />}
            label="Change PIN"
            onPress={() => {}}
            last
          />
        </Section>

        {/* Payments */}
        <Section title="Payments" delay={280}>
          <SettingRow
            icon={<Ionicons name="card-outline" size={16} color="#4361EE" />}
            label="Squad payment link"
            desc="Manage your collection link"
            onPress={() => {}}
          />
          <SettingRow
            icon={<Ionicons name="swap-horizontal-outline" size={16} color="#20C997" />}
            label="Payout settings"
            desc="Bank account for Squad transfers"
            onPress={() => {}}
          />
          <SettingRow
            icon={<Ionicons name="receipt-outline" size={16} color="#8892A4" />}
            label="Transaction limits"
            desc="View your current tier limits"
            onPress={() => {}}
            last
          />
        </Section>

        {/* Verification */}
        <Section title="Verification" delay={340}>
          <SettingRow
            icon={
              <MaterialCommunityIcons
                name="card-account-details-outline"
                size={16}
                color="#4361EE"
              />
            }
            label="Re-verify documents"
            desc="Update your NIN or CAC"
            onPress={() => {}}
          />
          <SettingRow
            icon={<Ionicons name="camera-outline" size={16} color="#8892A4" />}
            label="Retake selfie"
            desc="Update your biometric photo"
            onPress={() => {}}
            last
          />
        </Section>

        {/* Display */}
        <Section title="Display" delay={400}>
          <SettingRow
            icon={<Ionicons name="moon-outline" size={16} color="#4361EE" />}
            label="Dark mode"
            value={darkMode}
            onToggle={setDarkMode}
            disabled
          />
          <SettingRow
            icon={<Ionicons name="grid-outline" size={16} color="#8892A4" />}
            label="Compact dashboard"
            desc="Show denser layout on home"
            value={compactView}
            onToggle={setCompactView}
            last
          />
        </Section>

        {/* Support */}
        <Section title="Support" delay={460}>
          <SettingRow
            icon={<Ionicons name="help-circle-outline" size={16} color="#4361EE" />}
            label="Help & FAQ"
            onPress={() => {}}
          />
          <SettingRow
            icon={<Ionicons name="chatbubble-outline" size={16} color="#8892A4" />}
            label="Contact support"
            desc="Chat with our team"
            onPress={() => {}}
          />
          <SettingRow
            icon={<Feather name="star" size={16} color="#F0A500" />}
            label="Rate VendorProof"
            onPress={() => {}}
            last
          />
        </Section>

        {/* About */}
        <Section title="About" delay={520}>
          <SettingRow
            icon={<Ionicons name="information-circle-outline" size={16} color="#8892A4" />}
            label="Version"
            badge="v1.0.0"
            last={false}
          />
          <SettingRow
            icon={<Feather name="shield" size={16} color="#8892A4" />}
            label="Privacy policy"
            onPress={() => {}}
          />
          <SettingRow
            icon={<Ionicons name="document-text-outline" size={16} color="#8892A4" />}
            label="Terms of service"
            onPress={() => {}}
            last
          />
        </Section>

        {/* Danger zone */}
        <Animated.View entering={FadeInDown.delay(580)} className="mb-4">
          <Text className="mb-2.5 px-1 text-xs uppercase tracking-widest text-canvas-muted">
            Danger zone
          </Text>
          <View className="overflow-hidden rounded-3xl border border-alert-900/60 bg-canvas-surface">
            <SettingRow
              icon={<Ionicons name="log-out-outline" size={16} color="#E63946" />}
              label="Sign out"
              danger
              onPress={handleSignOut}
            />
            <SettingRow
              icon={<Ionicons name="trash-outline" size={16} color="#E63946" />}
              label="Delete account"
              desc="Permanently remove your data"
              danger
              onPress={() => {}}
              last
            />
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
