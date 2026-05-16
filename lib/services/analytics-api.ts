import { ApiResponse } from '../config/api';
import { authApi } from '../config/axios';
import { Tier } from '../utils/app';

export interface DashboardSummary {
  trustScore: number;
  currentTier: Tier;
  nextTier: Tier;
  kycScores: {
    document: number;
    biometric: number;
    transactionsConsistency: number;
    scoresToNextTier: number;
  };
  totalEarnings: number;
  totalOrders: number;
  averageMonthlyEarnings: number;
  disputesCount: number;
  weeklyEarnings: {
    day: string;
    earnings: number;
  }[];
  scoreTrajectory: {
    month: string;
    score: number;
  }[];
  recentOrders: {
    buyerName: string;
    amount: number;
    date: string;
    status: string;
  }[];
}

export const getDashboardAnalytics = async () => {
  const { data } = await authApi.get<ApiResponse<DashboardSummary>>('/analytics/me/dashboard');
  return data.data;
};

export interface AnalyticsActivity {
  totalTransactions: number;
  transactions: {
    buyerName: string;
    amount: number;
    date: string;
    status: string;
  }[];
  dailyVolume: {
    day: string;
    volume: number;
  }[];
  totalVolume: number;
  completedTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
}

export const getAnalyticsActivity = async () => {
  const { data } = await authApi.get<ApiResponse<AnalyticsActivity>>('/analytics/me/activity');
  return data.data;
};
