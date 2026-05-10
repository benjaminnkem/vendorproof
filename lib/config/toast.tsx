import Toast, { BaseToast } from 'react-native-toast-message';

export const toastConfig = {
  error: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#ef4444',
        backgroundColor: '#111827',
        borderRadius: 16,
      }}
      text1Style={{
        color: 'white',
        fontWeight: '700',
      }}
      text2Style={{
        color: '#d1d5db',
      }}
    />
  ),
};

export const showToast = {
  error: (title?: string, message?: string) => {
    Toast.show({
      type: 'error',
      text1: title,
      text2: message,
      position: 'top',
    });
  },

  info: (title?: string, message?: string) => {
    Toast.show({
      type: 'info',
      text1: title,
      text2: message,
      position: 'top',
    });
  },

  success: (title?: string, message?: string) => {
    Toast.show({
      type: 'success',
      text1: title,
      text2: message,
      position: 'top',
    });
  },
};
