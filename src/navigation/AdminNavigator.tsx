// src/navigation/AdminNavigator.tsx
// Bottom Tab Navigator dành riêng cho Quản trị viên VKU (Web & Mobile)

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AdminTabParamList } from '../types/navigation';

import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { AdminRoomManagementScreen } from '../screens/admin/AdminRoomManagementScreen';
import { AdminBookingListScreen } from '../screens/admin/AdminBookingListScreen';
import { AdminUserManagementScreen } from '../screens/admin/AdminUserManagementScreen';
import { AdminProfileScreen } from '../screens/admin/AdminProfileScreen';

const Tab = createBottomTabNavigator<AdminTabParamList>();

export function AdminNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#0F172A',
          borderTopColor: '#1E293B',
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'grid';

          if (route.name === 'AdminDashboard') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'AdminRooms') {
            iconName = focused ? 'cube' : 'cube-outline';
          } else if (route.name === 'AdminBookings') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === 'AdminUsers') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'AdminProfile') {
            iconName = focused ? 'shield-checkmark' : 'shield-checkmark-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{ tabBarLabel: 'Tổng quan' }}
      />
      <Tab.Screen
        name="AdminRooms"
        component={AdminRoomManagementScreen}
        options={{ tabBarLabel: 'Phòng học' }}
      />
      <Tab.Screen
        name="AdminBookings"
        component={AdminBookingListScreen}
        options={{ tabBarLabel: 'Đặt phòng' }}
      />
      <Tab.Screen
        name="AdminUsers"
        component={AdminUserManagementScreen}
        options={{ tabBarLabel: 'Cấp tài khoản' }}
      />
      <Tab.Screen
        name="AdminProfile"
        component={AdminProfileScreen}
        options={{ tabBarLabel: 'Hồ sơ' }}
      />
    </Tab.Navigator>
  );
}
