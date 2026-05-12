import * as SecureStore from 'expo-secure-store';
import type { AuthVendor } from '../store/auth.store';

const KEYS = {
  ACCESS_TOKEN: 'vp_access_token',
  REFRESH_TOKEN: 'vp_refresh_token',
  VENDOR: 'vp_vendor',
  BIOMETRIC: 'vp_biometric_enabled',
} as const;

export const storage = {
  async setTokens(access: string, refresh?: string) {
    await Promise.all([
      SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, access),
      refresh && SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, refresh),
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
