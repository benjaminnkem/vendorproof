import Toast from 'react-native-toast-message';

export const showToast = {
  success: (title: string, message?: string) =>
    Toast.show({
      type: 'success',
      text1: title,
      text2: message,
      position: 'top',
    }),

  error: (title: string, message?: string) =>
    Toast.show({
      type: 'error',
      text1: title,
      text2: message,
      position: 'top',
    }),

  info: (title: string, message?: string) =>
    Toast.show({
      type: 'info',
      text1: title,
      text2: message,
      position: 'top',
    }),

  custom: (options: {
    type?: 'success' | 'error' | 'info';
    title: string;
    message?: string;
    position?: 'top' | 'bottom';
    autoHide?: boolean;
    visibilityTime?: number;
  }) =>
    Toast.show({
      type: options.type ?? 'info',
      text1: options.title,
      text2: options.message,
      position: options.position ?? 'top',
      autoHide: options.autoHide ?? true,
      visibilityTime: options.visibilityTime ?? 4000,
    }),
};
