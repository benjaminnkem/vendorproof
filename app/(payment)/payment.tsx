import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';

export default function PaymentScreen() {
  const router = useRouter();

  const { uri, accessToken, from } = useLocalSearchParams<{
    uri: string;
    accessToken: string;
    from: string;
  }>();

  const handleNavigationChange = (navState: any) => {
    const { url } = navState;

    if (url.includes('/payment/verify')) {
      const parsed = new URL(url);

      const reference = parsed.searchParams.get('reference');
      const status = parsed.searchParams.get('status');

      router.replace({
        pathname: '/(payment)/verify-payment',
        params: { reference, accessToken, from },
      });
    }
  };

  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, 20);

  return (
    <WebView
      source={{ uri }}
      onNavigationStateChange={handleNavigationChange}
      startInLoadingState
      renderLoading={() => (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <ActivityIndicator />
        </View>
      )}
      style={{ paddingTop: topInset }}
    />
  );
}
