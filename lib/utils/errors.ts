export const ErrorCode = {
  VENDOR_NOT_FOUND: 'VENDOR_NOT_FOUND',
  OTP_INVALID: 'OTP_INVALID',
  OTP_EXPIRED: 'OTP_EXPIRED',
  OTP_MAX_ATTEMPTS: 'OTP_MAX_ATTEMPTS',
  OTP_SEND_FAILED: 'OTP_SEND_FAILED',
  SESSION_INVALID: 'SESSION_INVALID',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  REFRESH_TOKEN_EXPIRED: 'REFRESH_TOKEN_EXPIRED',
  REFRESH_TOKEN_INVALID: 'REFRESH_TOKEN_INVALID',
  ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',

  PHONE_ALREADY_REGISTERED: 'PHONE_ALREADY_REGISTERED',
  REGISTRATION_INCOMPLETE: 'REGISTRATION_INCOMPLETE',
  INVALID_PHONE_FORMAT: 'INVALID_PHONE_FORMAT',
  INVALID_BUSINESS_CATEGORY: 'INVALID_BUSINESS_CATEGORY',

  DOCUMENT_UNREADABLE: 'DOCUMENT_UNREADABLE',
  DOCUMENT_TAMPERED: 'DOCUMENT_TAMPERED',
  DOCUMENT_EXPIRED: 'DOCUMENT_EXPIRED',
  DOCUMENT_TYPE_MISMATCH: 'DOCUMENT_TYPE_MISMATCH',
  DOCUMENT_SCORE_TOO_LOW: 'DOCUMENT_SCORE_TOO_LOW',
  DOCUMENT_NAME_MISMATCH: 'DOCUMENT_NAME_MISMATCH',
  DOCUMENT_UPLOAD_FAILED: 'DOCUMENT_UPLOAD_FAILED',
  DOCUMENT_TOO_LARGE: 'DOCUMENT_TOO_LARGE',
  DOCUMENT_FORMAT_INVALID: 'DOCUMENT_FORMAT_INVALID',

  SELFIE_LIVENESS_FAILED: 'SELFIE_LIVENESS_FAILED',
  SELFIE_NO_FACE_DETECTED: 'SELFIE_NO_FACE_DETECTED',
  SELFIE_MULTIPLE_FACES: 'SELFIE_MULTIPLE_FACES',
  SELFIE_MATCH_FAILED: 'SELFIE_MATCH_FAILED',
  SELFIE_MATCH_LOW: 'SELFIE_MATCH_LOW',
  SELFIE_UPLOAD_FAILED: 'SELFIE_UPLOAD_FAILED',

  SCORE_COMPUTATION_FAILED: 'SCORE_COMPUTATION_FAILED',
  SCORE_PREREQUISITES_UNMET: 'SCORE_PREREQUISITES_UNMET',

  SQUAD_LINK_GENERATION_FAILED: 'SQUAD_LINK_GENERATION_FAILED',
  SQUAD_COLLECTION_FAILED: 'SQUAD_COLLECTION_FAILED',
  SQUAD_TRANSFER_FAILED: 'SQUAD_TRANSFER_FAILED',
  SQUAD_WEBHOOK_SIGNATURE_INVALID: 'SQUAD_WEBHOOK_SIGNATURE_INVALID',
  SQUAD_INSUFFICIENT_BALANCE: 'SQUAD_INSUFFICIENT_BALANCE',
  PAYMENT_LINK_NOT_FOUND: 'PAYMENT_LINK_NOT_FOUND',
  PAYOUT_FAILED: 'PAYOUT_FAILED',

  VENDOR_ALREADY_VERIFIED: 'VENDOR_ALREADY_VERIFIED',
  VENDOR_UPDATE_FAILED: 'VENDOR_UPDATE_FAILED',
  BADGE_NOT_FOUND: 'BADGE_NOT_FOUND',
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  UNPROCESSABLE: 'UNPROCESSABLE',
  RATE_LIMITED: 'RATE_LIMITED',
  SERVER_ERROR: 'SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',

  NETWORK_OFFLINE: 'NETWORK_OFFLINE',
  NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
  UNKNOWN: 'UNKNOWN',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export type ErrorSeverity = 'error' | 'warning' | 'info';

export interface AppError {
  code: ErrorCode;
  message: string;
  severity: ErrorSeverity;
  retryable: boolean;
  redirectToLogin: boolean;
  raw?: unknown;
}

const MESSAGES: Record<
  ErrorCode,
  { message: string; severity: ErrorSeverity; retryable: boolean; redirectToLogin: boolean }
> = {
  // Auth
  VENDOR_NOT_FOUND: {
    message: "We couldn't find an account with that number. Please check it or sign up.",
    severity: 'error',
    retryable: false,
    redirectToLogin: false,
  },
  OTP_INVALID: {
    message: 'That code is incorrect. Please check your SMS and try again.',
    severity: 'error',
    retryable: false,
    redirectToLogin: false,
  },
  OTP_EXPIRED: {
    message: 'Your code has expired. Tap Resend to get a new one.',
    severity: 'warning',
    retryable: false,
    redirectToLogin: false,
  },
  OTP_MAX_ATTEMPTS: {
    message: 'Too many incorrect attempts. Request a new code and try again.',
    severity: 'error',
    retryable: false,
    redirectToLogin: false,
  },
  OTP_SEND_FAILED: {
    message: "We couldn't send your SMS right now. Please try again in a moment.",
    severity: 'error',
    retryable: true,
    redirectToLogin: false,
  },
  SESSION_INVALID: {
    message: 'Your session is no longer valid. Please sign in again.',
    severity: 'error',
    retryable: false,
    redirectToLogin: true,
  },
  TOKEN_EXPIRED: {
    message: 'Your session expired. Signing you in again…',
    severity: 'info',
    retryable: false,
    redirectToLogin: false,
  },
  TOKEN_INVALID: {
    message: 'Your session is invalid. Please sign in again.',
    severity: 'error',
    retryable: false,
    redirectToLogin: true,
  },
  REFRESH_TOKEN_EXPIRED: {
    message: 'Your session has ended. Please sign in to continue.',
    severity: 'info',
    retryable: false,
    redirectToLogin: true,
  },
  REFRESH_TOKEN_INVALID: {
    message: 'Your session is no longer valid. Please sign in again.',
    severity: 'error',
    retryable: false,
    redirectToLogin: true,
  },
  ACCOUNT_SUSPENDED: {
    message: 'Your account has been suspended. Contact support for help.',
    severity: 'error',
    retryable: false,
    redirectToLogin: true,
  },

  // Onboarding
  PHONE_ALREADY_REGISTERED: {
    message: 'An account already exists with this number. Sign in instead.',
    severity: 'error',
    retryable: false,
    redirectToLogin: false,
  },
  REGISTRATION_INCOMPLETE: {
    message: 'Your registration is incomplete. Please go back and fill in all fields.',
    severity: 'error',
    retryable: false,
    redirectToLogin: false,
  },
  INVALID_PHONE_FORMAT: {
    message: 'Please enter a valid Nigerian phone number.',
    severity: 'error',
    retryable: false,
    redirectToLogin: false,
  },
  INVALID_BUSINESS_CATEGORY: {
    message: 'Please select a valid business category.',
    severity: 'error',
    retryable: false,
    redirectToLogin: false,
  },

  // Document verification
  DOCUMENT_UNREADABLE: {
    message: "We couldn't read your document. Make sure the image is clear, flat, and well-lit.",
    severity: 'error',
    retryable: true,
    redirectToLogin: false,
  },
  DOCUMENT_TAMPERED: {
    message: 'Our AI detected signs of alteration on this document. Please upload an original.',
    severity: 'error',
    retryable: false,
    redirectToLogin: false,
  },
  DOCUMENT_EXPIRED: {
    message: 'This document has expired. Please upload a current, valid document.',
    severity: 'error',
    retryable: false,
    redirectToLogin: false,
  },
  DOCUMENT_TYPE_MISMATCH: {
    message:
      "The document you uploaded doesn't match the type you selected. Please check and retry.",
    severity: 'error',
    retryable: true,
    redirectToLogin: false,
  },
  DOCUMENT_SCORE_TOO_LOW: {
    message: 'Your document score was too low. Ensure the full document is visible with no glare.',
    severity: 'error',
    retryable: true,
    redirectToLogin: false,
  },
  DOCUMENT_NAME_MISMATCH: {
    message:
      "The name on your document doesn't match your registration. Please check your details.",
    severity: 'error',
    retryable: false,
    redirectToLogin: false,
  },
  DOCUMENT_UPLOAD_FAILED: {
    message: "Your document didn't upload. Check your connection and try again.",
    severity: 'error',
    retryable: true,
    redirectToLogin: false,
  },
  DOCUMENT_TOO_LARGE: {
    message: 'Your image is too large. Please use a photo under 5MB.',
    severity: 'error',
    retryable: true,
    redirectToLogin: false,
  },
  DOCUMENT_FORMAT_INVALID: {
    message: 'That file format is not supported. Please upload a JPG or PNG photo.',
    severity: 'error',
    retryable: true,
    redirectToLogin: false,
  },

  // Biometric
  SELFIE_LIVENESS_FAILED: {
    message: "We couldn't confirm you're live. Please follow the prompts carefully and try again.",
    severity: 'error',
    retryable: true,
    redirectToLogin: false,
  },
  SELFIE_NO_FACE_DETECTED: {
    message: 'No face was detected. Make sure your full face is visible and the lighting is good.',
    severity: 'error',
    retryable: true,
    redirectToLogin: false,
  },
  SELFIE_MULTIPLE_FACES: {
    message: 'More than one face was detected. Please take your selfie alone.',
    severity: 'error',
    retryable: true,
    redirectToLogin: false,
  },
  SELFIE_MATCH_FAILED: {
    message: "Your selfie didn't match your ID. Please ensure you're using your own document.",
    severity: 'error',
    retryable: true,
    redirectToLogin: false,
  },
  SELFIE_MATCH_LOW: {
    message:
      'Match confidence was too low. Try better lighting and ensure your face is fully visible.',
    severity: 'error',
    retryable: true,
    redirectToLogin: false,
  },
  SELFIE_UPLOAD_FAILED: {
    message: "Your selfie didn't upload. Check your connection and try again.",
    severity: 'error',
    retryable: true,
    redirectToLogin: false,
  },

  // Trust score
  SCORE_COMPUTATION_FAILED: {
    message: "We couldn't compute your Trust Score right now. Please try again.",
    severity: 'error',
    retryable: true,
    redirectToLogin: false,
  },
  SCORE_PREREQUISITES_UNMET: {
    message: 'Please complete document and selfie verification before generating your score.',
    severity: 'warning',
    retryable: false,
    redirectToLogin: false,
  },

  // Squad / payments
  SQUAD_LINK_GENERATION_FAILED: {
    message: "We couldn't generate your payment link. Please try again.",
    severity: 'error',
    retryable: true,
    redirectToLogin: false,
  },
  SQUAD_COLLECTION_FAILED: {
    message: 'Payment collection failed. Please check your Squad account and retry.',
    severity: 'error',
    retryable: true,
    redirectToLogin: false,
  },
  SQUAD_TRANSFER_FAILED: {
    message: 'Payout failed. Your funds are safe — please try again shortly.',
    severity: 'error',
    retryable: true,
    redirectToLogin: false,
  },
  SQUAD_WEBHOOK_SIGNATURE_INVALID: {
    message: 'A payment event could not be verified. Contact support if this persists.',
    severity: 'warning',
    retryable: false,
    redirectToLogin: false,
  },
  SQUAD_INSUFFICIENT_BALANCE: {
    message: 'Your Squad balance is too low to complete this payout.',
    severity: 'error',
    retryable: false,
    redirectToLogin: false,
  },
  PAYMENT_LINK_NOT_FOUND: {
    message: "We couldn't find your payment link. Try regenerating it from your badge.",
    severity: 'error',
    retryable: true,
    redirectToLogin: false,
  },
  PAYOUT_FAILED: {
    message: 'Your payout could not be processed. Please try again or contact support.',
    severity: 'error',
    retryable: true,
    redirectToLogin: false,
  },

  // Vendor
  VENDOR_ALREADY_VERIFIED: {
    message: "You've already completed verification. Head to your dashboard.",
    severity: 'info',
    retryable: false,
    redirectToLogin: false,
  },
  VENDOR_UPDATE_FAILED: {
    message: "We couldn't save your changes. Please try again.",
    severity: 'error',
    retryable: true,
    redirectToLogin: false,
  },
  BADGE_NOT_FOUND: {
    message: "We couldn't find your badge. Please contact support.",
    severity: 'error',
    retryable: false,
    redirectToLogin: false,
  },

  // Generic HTTP
  BAD_REQUEST: {
    message: "Something about that request wasn't right. Please try again.",
    severity: 'error',
    retryable: false,
    redirectToLogin: false,
  },
  UNAUTHORIZED: {
    message: 'You need to sign in to do that.',
    severity: 'error',
    retryable: false,
    redirectToLogin: true,
  },
  FORBIDDEN: {
    message: "You don't have permission to do that.",
    severity: 'error',
    retryable: false,
    redirectToLogin: false,
  },
  NOT_FOUND: {
    message: "We couldn't find what you were looking for.",
    severity: 'error',
    retryable: false,
    redirectToLogin: false,
  },
  CONFLICT: {
    message: 'There was a conflict with your request. Please refresh and try again.',
    severity: 'error',
    retryable: true,
    redirectToLogin: false,
  },
  UNPROCESSABLE: {
    message: "We couldn't process that. Please check your input and try again.",
    severity: 'error',
    retryable: false,
    redirectToLogin: false,
  },
  RATE_LIMITED: {
    message: 'Too many requests. Please wait a moment before trying again.',
    severity: 'warning',
    retryable: true,
    redirectToLogin: false,
  },
  SERVER_ERROR: {
    message: 'Something went wrong on our end. Please try again.',
    severity: 'error',
    retryable: true,
    redirectToLogin: false,
  },
  SERVICE_UNAVAILABLE: {
    message: 'VendorProof is temporarily unavailable. Please try again in a few minutes.',
    severity: 'error',
    retryable: true,
    redirectToLogin: false,
  },

  // Network (client-side)
  NETWORK_OFFLINE: {
    message: "You're offline. Check your connection and try again.",
    severity: 'error',
    retryable: true,
    redirectToLogin: false,
  },
  NETWORK_TIMEOUT: {
    message: 'The request took too long. Check your connection and try again.',
    severity: 'error',
    retryable: true,
    redirectToLogin: false,
  },
  UNKNOWN: {
    message: 'Something unexpected went wrong. Please try again.',
    severity: 'error',
    retryable: true,
    redirectToLogin: false,
  },
} as const;

const HTTP_STATUS_FALLBACK: Record<number, ErrorCode> = {
  400: ErrorCode.BAD_REQUEST,
  401: ErrorCode.UNAUTHORIZED,
  403: ErrorCode.FORBIDDEN,
  404: ErrorCode.NOT_FOUND,
  409: ErrorCode.CONFLICT,
  422: ErrorCode.UNPROCESSABLE,
  429: ErrorCode.RATE_LIMITED,
  500: ErrorCode.SERVER_ERROR,
  502: ErrorCode.SERVICE_UNAVAILABLE,
  503: ErrorCode.SERVICE_UNAVAILABLE,
  504: ErrorCode.NETWORK_TIMEOUT,
};

export function resolveError(raw: unknown): AppError {
  if (isAxiosError(raw) && raw.response) {
    const { status, data } = raw.response;
    const code: ErrorCode = isKnownCode(data?.errorCode)
      ? data.errorCode
      : (HTTP_STATUS_FALLBACK[status] ?? ErrorCode.UNKNOWN);

    return { ...MESSAGES[code], code, raw };
  }

  if (isAxiosError(raw) && !raw.response) {
    const code =
      raw.code === 'ECONNABORTED' ? ErrorCode.NETWORK_TIMEOUT : ErrorCode.NETWORK_OFFLINE;
    return { ...MESSAGES[code], code, raw };
  }

  if (raw instanceof Error) {
    const code = isKnownCode(raw.message) ? (raw.message as ErrorCode) : ErrorCode.UNKNOWN;
    return {
      ...MESSAGES[code],
      message: MESSAGES[code].message,
      code,
      raw,
    };
  }

  return { ...MESSAGES[ErrorCode.UNKNOWN], code: ErrorCode.UNKNOWN, raw };
}

function isAxiosError(e: unknown): e is {
  response?: { status: number; data: any };
  code?: string;
  message: string;
} {
  return typeof e === 'object' && e !== null && 'isAxiosError' in e;
}

function isKnownCode(code: unknown): code is ErrorCode {
  return typeof code === 'string' && code in ErrorCode;
}
