import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons'; // 아이콘 사용

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index" // app/(tabs)/index.tsx 에 매핑
        options={{
          title: '재고',
          tabBarIcon: ({ color }) => <Ionicons name="cube-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="scan" // app/(tabs)/scan.tsx 에 매핑
        options={{
          title: '스캔',
          tabBarIcon: ({ color }) => <Ionicons name="scan-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings" // app/(tabs)/settings.tsx 에 매핑
        options={{
          title: '설정',
          tabBarIcon: ({ color }) => <Ionicons name="settings-outline" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}