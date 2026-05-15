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
