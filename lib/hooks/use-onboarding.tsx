import { useMutation } from '@tanstack/react-query';
import {
  computeTrustScore,
  registerVendor,
  verifyDocument,
  verifySelfie,
  type ComputeTrustScorePayload,
  type RegisterVendorPayload,
  type VerifyDocumentPayload,
  type VerifySelfiePayload,
} from '../services/onboarding-api';

export function useRegisterVendor() {
  return useMutation({
    mutationFn: (payload: RegisterVendorPayload) => registerVendor(payload),
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
