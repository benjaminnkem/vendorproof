import { ApiResponse } from '../config/api';
import { publicApi } from '../config/axios';
import type { TrustScore } from '../store/onboarding.store';

const SIMULATED_DELAY = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface RegisterVendorPayload {
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber: string;
}

export interface RegisterVendorResponse {
  nextStep: number;
}

export interface VerifyDocumentPayload {
  vendorId: string;
  documentType: string;
  documentUri: string;
}

export interface VerifyDocumentResponse {
  documentScore: number;
  extractedName: string;
  documentValid: boolean;
  anomalies: string[];
}

export interface VerifySelfiePayload {
  vendorId: string;
  selfieUri: string;
}

export interface VerifySelfieResponse {
  biometricScore: number;
  livenessPass: boolean;
  matchConfidence: number;
}

export interface ComputeTrustScorePayload {
  vendorId: string;
}

export interface ComputeTrustScoreResponse extends TrustScore {}

export interface RegisterVendorMeta {
  otp: string;
}

export async function registerVendor(payload: RegisterVendorPayload) {
  const { data } = await publicApi.post<ApiResponse<RegisterVendorResponse, RegisterVendorMeta>>(
    '/auth/signup/step-1',
    payload
  );
  return data;
}

export interface VerifyOtpPayload {
  phoneNumber: string;
  otpCode: string;
}

export interface VerifyOtpResponse {
  nextStep: number;
  accessToken: string;
}

export async function verifyOtp(payload: VerifyOtpPayload) {
  const { data } = await publicApi.post<ApiResponse<VerifyOtpResponse>>(
    '/auth/signup/step-2',
    payload
  );
  return data.data;
}

export async function verifyDocument(
  payload: VerifyDocumentPayload
): Promise<VerifyDocumentResponse> {
  await SIMULATED_DELAY(2500);

  const score = Math.floor(Math.random() * 20) + 78;
  return {
    documentScore: score,
    extractedName: 'CHINEDU OKAFOR',
    documentValid: true,
    anomalies: [],
  };
}

export const updateKycDocuments = async ({
  payload,
  accessToken,
}: {
  payload: FormData;
  accessToken: string;
}) => {
  const { data } = await publicApi.post<ApiResponse<RegisterVendorResponse>>(
    '/auth/signup/step-3',
    payload,
    { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${accessToken}` } }
  );
  return data.data;
};

export const updateBusinessProfile = async ({
  payload,
  accessToken,
}: {
  payload: FormData;
  accessToken: string;
}) => {
  const { data } = await publicApi.post<ApiResponse<VerifyOtpResponse>>(
    '/auth/signup/step-4',
    payload,
    { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${accessToken}` } }
  );
  return data.data;
};

export async function verifySelfie(payload: VerifySelfiePayload): Promise<VerifySelfieResponse> {
  await SIMULATED_DELAY(2000);

  const confidence = Math.floor(Math.random() * 15) + 83;
  return {
    biometricScore: confidence,
    livenessPass: true,
    matchConfidence: confidence,
  };
}

export async function computeTrustScore(
  payload: ComputeTrustScorePayload
): Promise<ComputeTrustScoreResponse> {
  await SIMULATED_DELAY(3000);

  const doc = Math.floor(Math.random() * 15) + 80;
  const bio = Math.floor(Math.random() * 15) + 82;
  const overall = Math.round(doc * 0.35 + bio * 0.35 + 72 * 0.3);

  return {
    overall,
    documentScore: doc,
    biometricScore: bio,
    tier: overall >= 90 ? 'gold' : overall >= 80 ? 'silver' : 'bronze',
    squadPaymentLink: 'https://sandbox-pay.squadco.com/VENDORPROOF_DEMO',
  };
}
