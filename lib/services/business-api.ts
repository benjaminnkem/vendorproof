import { ApiResponse } from '../config/api';
import { authApi, publicApi } from '../config/axios';

interface GetProfileResponse {
  id: number;
  name: string;
  description: string;
  logo: string | null;
  showCaseImages: string[];
  email: string | null;
  phoneNumber: string;
  alternativePhoneNumber: string | null;
  category: string | null;
  slug: string;
  trustScore: number;
  kycStatus: string;
  paymentLink: string;
  qrCodeUrl: string;
  createdAt: string;
  socials: Array<{
    id: number;
    platform: string;
    url: string;
  }>;
  tier: {
    name: string;
    description: string;
  };
  trustScoreHistories: Array<{
    score: number;
    createdAt: string;
  }>;
}

export const getBusinessProfile = async (slug: string) => {
  const { data } = await publicApi.get<ApiResponse<GetProfileResponse>>(`/business/${slug}`);
  return data.data;
};

export const updateBusinessProfile = async ({
  payload,
  accessToken,
}: {
  payload: FormData;
  accessToken: string;
}) => {
  const { data } = await publicApi.patch<ApiResponse<GetProfileResponse>>('/business/me', payload, {
    headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
};

export const addBusinessSocialLink = async (body: { platform: string; url: string }) => {
  const { data } = await authApi.post<ApiResponse<GetProfileResponse>>(
    '/business/me/socials',
    body
  );
  return data.data;
};

export const removeBusinessSocialLink = async (id: number) => {
  const { data } = await authApi.delete<ApiResponse<GetProfileResponse>>(
    `/business/me/socials/${id}`
  );
  return data.data;
};

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
  isPrimary: boolean;
}

export const getBusinessBankDetails = async () => {
  const { data } = await authApi.get<ApiResponse<Array<BankDetails>>>('/business/me/bank-details');
  return data.data;
};

export const updateBankDetails = async ({
  id,
  payload,
}: {
  id: number;
  payload: Partial<BankDetails>;
}) => {
  const { data } = await authApi.patch<ApiResponse<BankDetails>>(
    `/business/me/bank-details/${id}`,
    payload
  );
  return data.data;
};

export const removeBusinessBankDetails = async (id: number) => {
  const { data } = await authApi.delete<ApiResponse<BankDetails>>(
    `/business/me/bank-details/${id}`
  );
  return data.data;
};

interface PaymentLink {
  token: string;
  url: string;
}

export const getPaymentLink = async () => {
  const { data } = await authApi.get<ApiResponse<PaymentLink>>('/business/me/payment-link');
  return data.data;
};

interface QuickPaymentLink {
  id: number;
  token: string;
  amount: number;
  description: string;
  isOneTime: boolean;
  isUsed: boolean;
  expiresAt: string;
  createdAt: string;
  url: string;
}

export const listQuickPaymentLinks = async () => {
  const { data } = await authApi.get<ApiResponse<Array<QuickPaymentLink>>>(
    '/business/me/payment-links/quick'
  );
  return data.data;
};

interface GenerateOneTimePaymentLinkPayload {
  amount: string;
  description: string;
  expiresInHours: string;
}

export const generateOneTimePaymentLink = async (payload: GenerateOneTimePaymentLinkPayload) => {
  const { data } = await authApi.post<ApiResponse<QuickPaymentLink>>(
    '/business/me/payment-links/quick',
    payload
  );
  return data.data;
};

export const deleteQuickPaymentLink = async (id: string) => {
  const { data } = await authApi.delete<ApiResponse<QuickPaymentLink>>(
    `/business/me/payment-links/quick/${id}`
  );
  return data.data;
};

interface CreateServicePayload {
  name: string;
  description: string;
  amount: string;
  bankDetailsId: string;
}

export const createService = async (payload: CreateServicePayload) => {
  const { data } = await authApi.post<ApiResponse<QuickPaymentLink>>(
    '/business/me/services',
    payload
  );
  return data.data;
};

export interface Service {
  id: number;
  name: string;
  description: string;
  amount: number;
  bankDetailsId: number;
  paymentUrl: string;
  createdAt: string;
}

export const getServices = async () => {
  const { data } = await authApi.get<ApiResponse<Array<Service>>>('/business/me/services');
  return data.data;
};

export const updateService = async ({
  id,
  payload,
}: {
  id: string;
  payload: Partial<CreateServicePayload>;
}) => {
  const { data } = await authApi.patch<ApiResponse<Service>>(
    `/business/me/services/${id}`,
    payload
  );
  return data.data;
};

export const deleteService = async (id: string) => {
  const { data } = await authApi.delete<ApiResponse<Service>>(`/business/me/services/${id}`);
  return data.data;
};
