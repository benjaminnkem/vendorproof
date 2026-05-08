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
  fullName: string;
  phone: string;
  businessName: string;
  category: BusinessCategory | '';
  documentType: DocumentType | '';
  documentUri: string;
  selfieUri: string;
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
  fullName: '',
  phone: '',
  businessName: '',
  category: '',
  documentType: '',
  documentUri: '',
  selfieUri: '',
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
