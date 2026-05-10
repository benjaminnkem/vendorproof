import type { TrustScore } from '../store/onboarding.store';

const SIMULATED_DELAY = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface RegisterVendorPayload {
  fullName: string;
  phoneNumber: string;
  businessName: string;
  category: string;
}

export interface RegisterVendorResponse {
  vendorId: string;
  squadPaymentLink: string;
  message: string;
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

// ── Simulated API functions ──────────────────────────────────────────────────
// Replace each function body with a real axios/fetch call to your NestJS backend.
// The signatures, payload shapes, and return types stay the same.

export async function registerVendor(
  payload: RegisterVendorPayload
): Promise<RegisterVendorResponse> {
  await SIMULATED_DELAY(1200);

  // TODO: replace with real call
  // const { data } = await apiClient.post('/vendors/register', payload);
  // return data;

  return {
    vendorId: `vnd_${Math.random().toString(36).slice(2, 10)}`,
    squadPaymentLink: 'https://sandbox-pay.squadco.com/VENDORPROOF_DEMO',
    message: 'Vendor registered successfully',
  };
}

export async function verifyDocument(
  payload: VerifyDocumentPayload
): Promise<VerifyDocumentResponse> {
  await SIMULATED_DELAY(2500);

  // TODO: replace with real call
  // const formData = new FormData();
  // formData.append('vendorId', payload.vendorId);
  // formData.append('documentType', payload.documentType);
  // formData.append('document', { uri: payload.documentUri, type: 'image/jpeg', name: 'doc.jpg' } as any);
  // const { data } = await apiClient.post('/verification/document', formData, {
  //   headers: { 'Content-Type': 'multipart/form-data' },
  // });
  // return data;

  const score = Math.floor(Math.random() * 20) + 78;
  return {
    documentScore: score,
    extractedName: 'CHINEDU OKAFOR',
    documentValid: true,
    anomalies: [],
  };
}

export async function verifySelfie(payload: VerifySelfiePayload): Promise<VerifySelfieResponse> {
  await SIMULATED_DELAY(2000);

  // TODO: replace with real call
  // const formData = new FormData();
  // formData.append('vendorId', payload.vendorId);
  // formData.append('selfie', { uri: payload.selfieUri, type: 'image/jpeg', name: 'selfie.jpg' } as any);
  // const { data } = await apiClient.post('/verification/selfie', formData, {
  //   headers: { 'Content-Type': 'multipart/form-data' },
  // });
  // return data;

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

  // TODO: replace with real call
  // const { data } = await apiClient.post('/vendors/trust-score', payload);
  // return data;

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
