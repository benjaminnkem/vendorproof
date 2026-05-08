import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import React, { useEffect } from 'react';
import { Dimensions, Platform, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const TAB_COUNT = 5;
const TAB_WIDTH = (width - 48) / TAB_COUNT;

type TabIcon = {
  name: string;
  focused: boolean;
  color: string;
};

function TabIcon({ route, focused }: { route: string; focused: boolean }) {
  const color = focused ? '#4361EE' : '#8892A4';
  const size = focused ? 22 : 20;

  const scaleVal = useSharedValue(focused ? 1 : 0.9);

  useEffect(() => {
    scaleVal.value = withSpring(focused ? 1.1 : 0.9, { damping: 12, stiffness: 200 });
    setTimeout(() => {
      scaleVal.value = withSpring(1, { damping: 14, stiffness: 180 });
    }, 150);
  }, [focused]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleVal.value }],
  }));

  const icons: Record<string, React.ReactNode> = {
    index: (
      <Animated.View style={animStyle}>
        <Ionicons name={focused ? 'grid' : 'grid-outline'} size={size} color={color} />
      </Animated.View>
    ),
    badge: (
      <Animated.View style={animStyle}>
        <MaterialCommunityIcons
          name={focused ? 'shield-check' : 'shield-check-outline'}
          size={size}
          color={color}
        />
      </Animated.View>
    ),
    transactions: (
      <Animated.View style={animStyle}>
        <Ionicons
          name={focused ? 'swap-vertical' : 'swap-vertical-outline'}
          size={size}
          color={color}
        />
      </Animated.View>
    ),
    profile: (
      <Animated.View style={animStyle}>
        <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
      </Animated.View>
    ),
    settings: (
      <Animated.View style={animStyle}>
        <Ionicons name={focused ? 'settings' : 'settings-outline'} size={size} color={color} />
      </Animated.View>
    ),
  };

  return icons[route] ?? null;
}

const LABELS: Record<string, string> = {
  index: 'Home',
  badge: 'Badge',
  transactions: 'Activity',
  profile: 'Profile',
  settings: 'Settings',
};

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  // Pill indicator position
  const pillX = useSharedValue(state.index * TAB_WIDTH);
  const pillWidth = useSharedValue(TAB_WIDTH);
  const pillOpacity = useSharedValue(1);

  useEffect(() => {
    pillX.value = withSpring(state.index * TAB_WIDTH, {
      damping: 20,
      stiffness: 300,
      mass: 0.8,
    });
  }, [state.index]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillX.value }],
    width: TAB_WIDTH,
  }));

  return (
    <View
      style={{
        position: 'absolute',
        bottom: insets.bottom + 12,
        left: 24,
        right: 24,
      }}>
      {/* Floating container */}
      <View
        style={{
          borderRadius: 24,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: '#1E2535',
          backgroundColor: '#0D1120F0',
        }}>
        {/* Blur background */}
        {Platform.OS === 'ios' && (
          <BlurView
            intensity={60}
            tint="dark"
            style={{ position: 'absolute', inset: 0, borderRadius: 24 }}
          />
        )}

        <View style={{ flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 0 }}>
          {/* Active pill background */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: 6,
                bottom: 6,
                borderRadius: 16,
                backgroundColor: '#1a1f3a',
                borderWidth: 1,
                borderColor: '#2D3FCC40',
              },
              pillStyle,
            ]}
          />

          {state.routes.map((route, index) => {
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                activeOpacity={0.8}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 8,
                  gap: 3,
                }}>
                <TabIcon route={route.name} focused={isFocused} />
                <Text
                  style={{
                    fontSize: 10,
                    color: isFocused ? '#7B8FF7' : '#8892A4',
                    fontWeight: isFocused ? '600' : '400',
                    letterSpacing: 0.2,
                  }}>
                  {LABELS[route.name] ?? route.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}
