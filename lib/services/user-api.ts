import { ApiResponse } from '../config/api';
import { authApi } from '../config/axios';

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
    socials: [];
    trustScore: number;
    showcaseImages?: string[];
    description?: string;
    phoneNumber?: string;
    category?: string;
  };
}

export const getProfile = async () => {
  const { data } = await authApi.get<ApiResponse<GetProfileResponse>>('/auth/user');
  return data.data;
};
