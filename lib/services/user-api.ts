import { ApiResponse } from '../config/api';
import { authApi } from '../config/axios';
import { BankDetail } from './business-api';

export interface GetProfileResponse {
  email: null;
  firstName: string;
  id: number;
  lastName: string;
  phoneNumber: string;
  business: {
    id: number;
    name: string;
    slug: string;
    logo: null;
    kycStatus: string;
    showCaseImages: [];
    socials: {
      id: number;
      platform: string;
      url: string;
    }[];
    trustScore: number;
    showcaseImages?: string[];
    description?: string;
    phoneNumber?: string;
    category?: string;
    bankDetails: BankDetail[];
    createdAt: string;
    tier: {
      id: number;
      name: string;
      description: string;
      minScore: number;
      maxScore: number;
      createdAt: string;
      updatedAt: string;
    };
    paymentLink: string;
    qrCodeUrl: string | null;
  };
}

export const getProfile = async () => {
  const { data } = await authApi.get<ApiResponse<GetProfileResponse>>('/auth/user');
  return data.data;
};
