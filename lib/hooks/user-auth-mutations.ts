import { refreshAccessToken, sendOTP, verifyOTP } from '@/lib/services/auth';
import { useMutation } from '@tanstack/react-query';

export function useSendOTP() {
  return useMutation({
    mutationFn: sendOTP,
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
