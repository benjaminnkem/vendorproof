import axios, { AxiosInstance } from 'axios';
import { storage } from '../services/auth';
import { useAuthStore } from '../store/auth.store';
import { resolveError } from '../utils/errors';
import env from './env';
import { showToast } from './toast';

export const publicApi: AxiosInstance = axios.create({
  baseURL: env.API_URL,
});

export const authApi: AxiosInstance = axios.create({
  baseURL: env.API_URL,
});

authApi.defaults.headers.common['Content-Type'] = 'application/json';

publicApi.interceptors.request.use(async (config) => {
  return config;
});

authApi.interceptors.request.use(async (config) => {
  const { access } = await storage.getTokens();
  if (access) config.headers['Authorization'] = `Bearer ${access}`;

  return config;
});

authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        const { refresh } = await storage.getTokens();
        if (!refresh) {
          useAuthStore.getState().signOut();
          return Promise.reject(error);
        }

        try {
          const { data } = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/auth/refresh`, {
            refreshToken: refresh,
          });
          await storage.setTokens(data.accessToken, refresh);
          error.config!.headers.Authorization = `Bearer ${data.accessToken}`;
          return authApi.request(error.config!);
        } catch {
          useAuthStore.getState().signOut();
        }
      }

      return Promise.reject(error);
    }
  }
);

publicApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isAxiosError(error)) {
      const appError = resolveError(error);
      const errorMessage = error.response?.data?.message || appError.message;

      showToast.error(appError.code, errorMessage);

      console.log(error.response?.data);
      return Promise.reject(error);
    }
  }
);
