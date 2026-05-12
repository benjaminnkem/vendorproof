import { ApiResponse } from '../config/api';
import { authApi } from '../config/axios';

export interface GetProfileResponse {
  email: null;
  firstName: string;
  id: number;
  lastName: string;
  phoneNumber: string;
  businesses: {
    id: number;
    name: string;
    slug: string;
    logo: null;
    kycStatus: string;
    showCaseImages: [];
    socials: [];
    category: null;
    trustScore: number;
  }[];
}

export const getProfile = async () => {
  const { data } = await authApi.get<ApiResponse<GetProfileResponse>>('/auth/user');
  return data.data;
};
