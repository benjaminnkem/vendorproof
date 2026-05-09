import * as SecureStore from 'expo-secure-store';
import type { AuthVendor } from '../store/auth.store';

const KEYS = {
  ACCESS_TOKEN: 'vp_access_token',
  REFRESH_TOKEN: 'vp_refresh_token',
  VENDOR: 'vp_vendor',
  BIOMETRIC: 'vp_biometric_enabled',
} as const;

export const storage = {
  async setTokens(access: string, refresh: string) {
    await Promise.all([
      SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, access),
      SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, refresh),
    ]);
  },

  async getTokens(): Promise<{ access: string | null; refresh: string | null }> {
    const [access, refresh] = await Promise.all([
      SecureStore.getItemAsync(KEYS.ACCESS_TOKEN),
      SecureStore.getItemAsync(KEYS.REFRESH_TOKEN),
    ]);
    return { access, refresh };
  },

  async setVendor(vendor: AuthVendor) {
    await SecureStore.setItemAsync(KEYS.VENDOR, JSON.stringify(vendor));
  },

  async getVendor(): Promise<AuthVendor | null> {
    const raw = await SecureStore.getItemAsync(KEYS.VENDOR);
    return raw ? (JSON.parse(raw) as AuthVendor) : null;
  },

  async setBiometricEnabled(val: boolean) {
    await SecureStore.setItemAsync(KEYS.BIOMETRIC, val ? '1' : '0');
  },

  async getBiometricEnabled(): Promise<boolean> {
    const val = await SecureStore.getItemAsync(KEYS.BIOMETRIC);
    return val === '1';
  },

  async clearAll() {
    await Promise.all(Object.values(KEYS).map((k) => SecureStore.deleteItemAsync(k)));
  },
};

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface SendOTPPayload {
  phone: string;
}
export interface SendOTPResponse {
  sessionId: string;
  expiresIn: number;
}

export async function sendOTP(payload: SendOTPPayload): Promise<SendOTPResponse> {
  await delay(1100);

  if (payload.phone === '00000000000') {
    throw new Error('No vendor found with this phone number. Please complete registration first.');
  }

  // const { data } = await apiClient.post('/auth/send-otp', payload);
  // return data;

  return {
    sessionId: `sess_${Math.random().toString(36).slice(2, 10)}`,
    expiresIn: 60,
  };
}

export interface VerifyOTPPayload {
  phone: string;
  otp: string;
  sessionId: string;
}

export interface VerifyOTPResponse {
  accessToken: string;
  refreshToken: string;
  vendor: AuthVendor;
}

export async function verifyOTP(payload: VerifyOTPPayload): Promise<VerifyOTPResponse> {
  await delay(1300);

  if (payload.otp !== '123456' && payload.otp.length === 6) {
    throw new Error('Incorrect OTP. Please check your SMS and try again.');
  }

  // const { data } = await apiClient.post('/auth/verify-otp', payload);
  // return data;

  return {
    accessToken: `eyJ_access_${Math.random().toString(36).slice(2, 16)}`,
    refreshToken: `eyJ_refresh_${Math.random().toString(36).slice(2, 16)}`,
    vendor: {
      id: 'vnd_9f2a8c1d',
      fullName: 'Chinedu Okafor',
      businessName: 'Chinedu Electronics',
      phone: payload.phone,
      tier: 'gold',
      trustScore: 87,
      squadPaymentLink: 'https://sandbox-pay.squadco.com/CHINEDU_ELEC',
    },
  };
}

export interface RefreshTokenPayload {
  refreshToken: string;
}
export interface RefreshTokenResponse {
  accessToken: string;
}

export async function refreshAccessToken(
  payload: RefreshTokenPayload
): Promise<RefreshTokenResponse> {
  await delay(600);

  // const { data } = await apiClient.post('/auth/refresh', payload);
  // return data;

  return { accessToken: `eyJ_access_${Math.random().toString(36).slice(2, 16)}` };
}
