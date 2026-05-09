import { create } from 'zustand';

export interface AuthVendor {
  id: string;
  fullName: string;
  businessName: string;
  phone: string;
  tier: 'unverified' | 'bronze' | 'silver' | 'gold' | 'platinum';
  trustScore: number;
  squadPaymentLink: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  vendor: AuthVendor | null;
  isAuthenticated: boolean;
  biometricEnabled: boolean;

  setTokens: (access: string, refresh: string) => void;
  setVendor: (vendor: AuthVendor) => void;
  setBiometricEnabled: (val: boolean) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  vendor: null,
  isAuthenticated: false,
  biometricEnabled: false,

  setTokens: (accessToken, refreshToken) =>
    set({ accessToken, refreshToken, isAuthenticated: true }),

  setVendor: (vendor) => set({ vendor }),
  setBiometricEnabled: (biometricEnabled) => set({ biometricEnabled }),
  signOut: () =>
    set({ accessToken: null, refreshToken: null, vendor: null, isAuthenticated: false }),
}));
