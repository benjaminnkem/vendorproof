import useUser from '@/lib/hooks/use-user';
import { Tabs } from 'expo-router';
import CustomTabBar from '../../components/dashboard/tabbar';

export default function TabsLayout() {
  useUser();

  return (
    <Tabs tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="badge" options={{ title: 'Badge' }} />
      <Tabs.Screen name="transactions" options={{ title: 'Activity' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
