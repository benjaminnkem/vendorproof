import * as SecureStore from 'expo-secure-store';
import type { PersistStorage } from 'zustand/middleware';

export const secureStorage: PersistStorage<any> = {
  setItem: async (name, value) => {
    await SecureStore.setItemAsync(name, JSON.stringify(value));
  },
  getItem: async (name) => {
    const value = await SecureStore.getItemAsync(name);
    return value ? JSON.parse(value) : null;
  },
  removeItem: async (name) => {
    await SecureStore.deleteItemAsync(name);
  },
};

export const getStoreValueFor = async (key: string) => {
  let result = await SecureStore.getItemAsync(key);
  if (result) {
    return result;
  } else {
    return null;
  }
};

export const saveStoreValue = async (key: string, value: string) => {
  await SecureStore.setItemAsync(key, value);
};

export const removeStoreValue = async (key: string) => {
  await SecureStore.deleteItemAsync(key);
};
