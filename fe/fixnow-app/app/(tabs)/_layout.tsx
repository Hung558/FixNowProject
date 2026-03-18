import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9',
          elevation: 25,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.12,
          shadowRadius: 16,
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingBottom: Platform.OS === 'ios' ? 30 : 12,
          paddingTop: 12,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons size={26} name="home-variant" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Lịch sử',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons size={26} name="clipboard-text-clock" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Cá nhân',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons size={26} name="account" color={color} />,
        }}
      />
      <Tabs.Screen
        name="create-order"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="order-detail"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
