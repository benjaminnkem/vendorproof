import type { TrustTier } from '../store/onboarding.store';

export interface Transaction {
  id: string;
  buyerName: string;
  amount: number;
  date: string;
  status: 'success' | 'pending' | 'failed';
  category: string;
}

export interface ScoreHistory {
  date: string;
  score: number;
}

export interface VendorProfile {
  id: string;
  fullName: string;
  businessName: string;
  category: string;
  phone: string;
  location: string;
  joinDate: string;
  trustScore: number;
  documentScore: number;
  biometricScore: number;
  behavioralScore: number;
  tier: TrustTier;
  squadPaymentLink: string;
  totalEarnings: number;
  totalTransactions: number;
  disputeRate: number;
  avgOrderValue: number;
}

export const MOCK_VENDOR: VendorProfile = {
  id: 'vnd_9f2a8c1d',
  fullName: 'Chinedu Okafor',
  businessName: 'Chinedu Electronics',
  category: 'Electronics',
  phone: '08032145678',
  location: 'Lagos Island, Lagos',
  joinDate: 'March 2024',
  trustScore: 87,
  documentScore: 91,
  biometricScore: 94,
  behavioralScore: 76,
  tier: 'gold',
  squadPaymentLink: 'https://sandbox-pay.squadco.com/CHINEDU_ELEC',
  totalEarnings: 1_482_500,
  totalTransactions: 142,
  disputeRate: 0.7,
  avgOrderValue: 10_440,
};

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'txn_001',
    buyerName: 'Amara Eze',
    amount: 45000,
    date: '2024-05-09T10:23:00Z',
    status: 'success',
    category: 'Electronics',
  },
  {
    id: 'txn_002',
    buyerName: 'Bola Adeyemi',
    amount: 12500,
    date: '2024-05-09T08:11:00Z',
    status: 'success',
    category: 'Accessories',
  },
  {
    id: 'txn_003',
    buyerName: 'Kemi Oladele',
    amount: 78000,
    date: '2024-05-08T16:45:00Z',
    status: 'success',
    category: 'Electronics',
  },
  {
    id: 'txn_004',
    buyerName: 'Tunde Bakare',
    amount: 5500,
    date: '2024-05-08T12:30:00Z',
    status: 'pending',
    category: 'Accessories',
  },
  {
    id: 'txn_005',
    buyerName: 'Ngozi Nnadi',
    amount: 32000,
    date: '2024-05-07T14:20:00Z',
    status: 'success',
    category: 'Electronics',
  },
  {
    id: 'txn_006',
    buyerName: 'Seun Okafor',
    amount: 8750,
    date: '2024-05-07T09:05:00Z',
    status: 'failed',
    category: 'Services',
  },
  {
    id: 'txn_007',
    buyerName: 'Fatima Lawal',
    amount: 55000,
    date: '2024-05-06T17:50:00Z',
    status: 'success',
    category: 'Electronics',
  },
  {
    id: 'txn_008',
    buyerName: 'Emeka Nwosu',
    amount: 21000,
    date: '2024-05-06T11:15:00Z',
    status: 'success',
    category: 'Electronics',
  },
  {
    id: 'txn_009',
    buyerName: 'Chioma Okeke',
    amount: 14500,
    date: '2024-05-05T15:40:00Z',
    status: 'success',
    category: 'Accessories',
  },
  {
    id: 'txn_010',
    buyerName: 'Ade Williams',
    amount: 67000,
    date: '2024-05-05T10:00:00Z',
    status: 'success',
    category: 'Electronics',
  },
  {
    id: 'txn_011',
    buyerName: 'Yemi Adesanya',
    amount: 9200,
    date: '2024-05-04T13:25:00Z',
    status: 'success',
    category: 'Services',
  },
  {
    id: 'txn_012',
    buyerName: 'Lola Martins',
    amount: 38500,
    date: '2024-05-04T08:45:00Z',
    status: 'success',
    category: 'Electronics',
  },
];

export const MOCK_SCORE_HISTORY: ScoreHistory[] = [
  { date: 'Nov', score: 54 },
  { date: 'Dec', score: 61 },
  { date: 'Jan', score: 68 },
  { date: 'Feb', score: 72 },
  { date: 'Mar', score: 79 },
  { date: 'Apr', score: 83 },
  { date: 'May', score: 87 },
];

export const MOCK_WEEKLY_EARNINGS = [
  { day: 'Mon', amount: 45000 },
  { day: 'Tue', amount: 78000 },
  { day: 'Wed', amount: 32000 },
  { day: 'Thu', amount: 91000 },
  { day: 'Fri', amount: 55000 },
  { day: 'Sat', amount: 120000 },
  { day: 'Sun', amount: 61000 },
];

export const formatNaira = (amount: number): string => `₦${amount.toLocaleString('en-NG')}`;

export const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const TIER_CONFIG = {
  unverified: { color: '#8892A4', bg: '#1a1c22', label: 'Unverified' },
  bronze: { color: '#F0A500', bg: '#1a1205', label: 'Bronze' },
  silver: { color: '#B4B2A9', bg: '#1a1820', label: 'Silver' },
  gold: { color: '#F0A500', bg: '#1a1205', label: 'Gold' },
  platinum: { color: '#20C997', bg: '#0a1a14', label: 'Platinum' },
} as const;
