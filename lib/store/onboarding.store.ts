import { create } from 'zustand';

export type BusinessCategory =
  | 'electronics'
  | 'fashion'
  | 'food'
  | 'logistics'
  | 'beauty'
  | 'services'
  | 'groceries'
  | 'other';

export type DocumentType = 'nin' | 'cac' | 'utility';

export type TrustTier = 'unverified' | 'bronze' | 'silver' | 'gold' | 'platinum';

export interface OnboardingData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;

  businessName: string;
  businessEmail?: string;
  businessPhoneNumber?: string;
  businessAlternativePhoneNumber?: string;
  businessDescription?: string;
  businessLogo?: string;
  businessShowCaseImages?: string[];
  kycBusinessCacDocument?: string;
  kycBusinessTinNumber?: string;

  socials?: string;

  businessCategory: string;
  documentType: DocumentType;
  selfieUri: string;

  kycSelfie: string;
  kycIdDocument: string;

  accessToken?: string;
}

export interface TrustScore {
  overall: number;
  documentScore: number;
  biometricScore: number;
  tier: TrustTier;
  squadPaymentLink: string;
}

interface OnboardingState {
  step: number;
  data: OnboardingData;
  trustScore: TrustScore | null;
  setStep: (step: number) => void;
  updateData: (partial: Partial<OnboardingData>) => void;
  setTrustScore: (score: TrustScore) => void;
  reset: () => void;
}

const initialData: OnboardingData = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  businessName: '',
  businessCategory: '',
  documentType: 'nin',
  selfieUri: '',

  kycSelfie: '',
  kycIdDocument: '',

  accessToken: '',
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  step: 0,
  data: initialData,
  trustScore: null,
  setStep: (step) => set({ step }),
  updateData: (partial) => set((state) => ({ data: { ...state.data, ...partial } })),
  setTrustScore: (trustScore) => set({ trustScore }),
  reset: () => set({ step: 0, data: initialData, trustScore: null }),
}));
