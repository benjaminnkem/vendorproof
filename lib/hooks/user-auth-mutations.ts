import { refreshAccessToken, signIn, verifyOTP } from '@/lib/services/auth';
import { useMutation } from '@tanstack/react-query';

export function useSignIn() {
  return useMutation({
    mutationFn: signIn,
    retry: 1,
  });
}

export function useVerifyOTP() {
  return useMutation({
    mutationFn: verifyOTP,
    retry: 0,
  });
}

export function useRefreshToken() {
  return useMutation({
    mutationFn: refreshAccessToken,
  });
}
