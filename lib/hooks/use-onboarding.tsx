import { useMutation } from '@tanstack/react-query';
import {
  computeTrustScore,
  registerVendor,
  updateBusinessProfile,
  updateKycDocuments,
  verifyDocument,
  verifyOtp,
  verifySelfie,
  type ComputeTrustScorePayload,
  type RegisterVendorPayload,
  type VerifyDocumentPayload,
  type VerifyOtpPayload,
  type VerifySelfiePayload,
} from '../services/onboarding-api';

export function useRegisterVendor() {
  return useMutation({
    mutationFn: (payload: RegisterVendorPayload) => registerVendor(payload),
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: (payload: VerifyOtpPayload) => verifyOtp(payload),
    retry: 0,
  });
}

export function useUpdateKycDocuments() {
  return useMutation({
    mutationFn: (payload: { payload: FormData; accessToken: string }) =>
      updateKycDocuments(payload),
  });
}

export function useUpdateBusinessProfile() {
  return useMutation({
    mutationFn: (payload: { payload: FormData; accessToken: string }) =>
      updateBusinessProfile(payload),
  });
}

export function useVerifyDocument() {
  return useMutation({
    mutationFn: (payload: VerifyDocumentPayload) => verifyDocument(payload),
  });
}

export function useVerifySelfie() {
  return useMutation({
    mutationFn: (payload: VerifySelfiePayload) => verifySelfie(payload),
  });
}

export function useComputeTrustScore() {
  return useMutation({
    mutationFn: (payload: ComputeTrustScorePayload) => computeTrustScore(payload),
  });
}
