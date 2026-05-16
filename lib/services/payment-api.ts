import { ApiResponse } from '../config/api';
import { publicApi } from '../config/axios';

interface VerifyPayment {
  status: string;
  message: string;
  business: {
    name: string;
    slug: string;
  };
  ratingToken: string;
}

export const verifyPayment = async (ref: string) => {
  const { data } = await publicApi.get<ApiResponse<VerifyPayment>>(`/pay/verify/${ref}`);
  return data.data;
};

export const verifyOnboardingFeePayment = async (ref: string) => {
  const { data } = await publicApi.get<ApiResponse<VerifyPayment>>(
    `/pay/onboarding-fee/verify/${ref}`
  );
  return data.data;
};

export interface GetRating {
  paymentId: number;
  buyerName: string;
  amount: number;
  business: {
    name: string;
    logo: string;
    slug: string;
    trustScore: number;
  };
}

export const getRatingData = async (ratingToken: string) => {
  const { data } = await publicApi.get<ApiResponse<VerifyPayment>>(`/pay/rate/${ratingToken}`);
  return data.data;
};

export interface PaymentPage {
  business: {
    name: string;
    description: string;
    logo: string;
    slug: string;
    trustScore: number;
    kycStatus: string;
    tier: {
      name: string;
    };
    trustScoreHistories: {
      score: number;
      createdAt: string;
    }[];
  };
  paymentLink: {
    type: string;
    amount: number;
    description: string;
    isOneTime: boolean;
  };
}

export const getPaymentPage = async (token: string) => {
  const { data } = await publicApi.get<ApiResponse<PaymentPage>>(`/pay/${token}`);
  return data.data;
};

export interface InitiatePayment {
  buyerName: string;
  buyerEmail: string;
  amount: string;
  isServiceRendered: string;
}

export const initiatePayment = async ({
  token,
  payload,
}: {
  token: string;
  payload: InitiatePayment;
}) => {
  const { data } = await publicApi.post<ApiResponse<VerifyPayment>>(`/pay/${token}`, payload);
  return data.data;
};
