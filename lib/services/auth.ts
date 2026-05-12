import { ApiResponse } from '../config/api';
import { publicApi } from '../config/axios';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface SendOTPPayload {
  phoneNumber: string;
}
export interface SendOTPResponse {
  accessToken: string;
}

export interface SendOTPMeta {
  otp: string;
}

export async function signIn(payload: SendOTPPayload) {
  const { data } = await publicApi.post<ApiResponse<SendOTPResponse, SendOTPMeta>>(
    '/auth/signin',
    payload
  );
  return data;
}

export interface VerifyOTPPayload {
  phoneNumber: string;
  otp: string;
}

export interface VerifyOTPResponse {
  accessToken: string;
  nextStep: number;
}

export async function verifyOTP(payload: VerifyOTPPayload) {
  const { data } = await publicApi.post<ApiResponse<VerifyOTPResponse>>(
    '/auth/verify-signin-otp',
    payload
  );
  return data;
}

export interface RefreshTokenPayload {
  refreshToken: string;
}
export interface RefreshTokenResponse {
  accessToken: string;
}

export async function refreshAccessToken(
  payload: RefreshTokenPayload
): Promise<RefreshTokenResponse> {
  await delay(600);

  // const { data } = await apiClient.post('/auth/refresh', payload);
  // return data;

  return { accessToken: `eyJ_access_${Math.random().toString(36).slice(2, 16)}` };
}
