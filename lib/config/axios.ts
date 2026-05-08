import axios, { AxiosInstance } from 'axios';
import env from './env';
import { getStoreValueFor } from './storage';

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
  const accessToken = await getStoreValueFor('accessToken');

  if (accessToken) config.headers['Authorization'] = `Bearer ${accessToken}`;

  return config;
});

authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      return Promise.reject(error);
    }
  }
);
