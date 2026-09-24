// src/navigation/UserNavigator.tsx
// Main Bottom Tab + User Stack Navigation – Phase 2

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList, MainTabParamList } from '../types/navigation';

// Screens
import { HomeScreen } from '../screens/user/HomeScreen';
import { MyBookingsScreen } from '../screens/user/MyBookingsScreen';
import { ProfileScreen } from '../screens/user/ProfileScreen';
import { RoomDetailScreen } from '../screens/user/RoomDetailScreen';
import { BookingConfirmScreen } from '../screens/user/BookingConfirmScreen';

// ─── Wrappers chuyển đổi Navigation-prop → Callback-prop ──────────────────────
// Giúp tái sử dụng các screens Phase 1 mà không cần sửa chúng

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// HomeScreen wrapper
function BrowseTab() {
  return (
    <HomeScreen
      onSelectRoom={(room) => {
        // Truyền navigation qua context vì HomeScreen không nhận navigation prop
        // Sẽ được xử lý bằng RootStack navigation ở wrapper bên dưới
      }}
    />
  );
}

// ─── Main Tab Navigator ───────────────────────────────────────────────────────
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#1E3A5F',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E7EB',
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'home';
          if (route.name === 'Browse') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'MyBookings') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Browse"
        options={{ tabBarLabel: 'Tìm phòng' }}
      >
        {(props) => (
          <HomeScreenWrapper {...props} />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="MyBookings"
        component={MyBookingsScreen}
        options={{ tabBarLabel: 'Lịch đặt' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Hồ sơ' }}
      />
    </Tab.Navigator>
  );
}

// Wrapper cung cấp navigation prop cho HomeScreen
function HomeScreenWrapper({ navigation }: any) {
  return (
    <HomeScreen
      onSelectRoom={(room) => {
        const rootNav = navigation.getParent() || navigation;
        rootNav.navigate('RoomDetail', { room });
      }}
    />
  );
}

// ─── Root Stack Navigator ─────────────────────────────────────────────────────
export function UserNavigator() {
  return (
    <RootStack.Navigator>
      <RootStack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="RoomDetail"
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {({ route, navigation }: any) => (
          <RoomDetailScreen
            room={route.params.room}
            onBack={() => navigation.goBack()}
            onConfirm={(order) =>
              navigation.replace('BookingConfirm', {
                order,
                room: route.params.room,
              })
            }
          />
        )}
      </RootStack.Screen>
      <RootStack.Screen
        name="BookingConfirm"
        options={{
          headerShown: true,
          headerTitle: 'Đặt phòng thành công',
          headerStyle: { backgroundColor: '#1E3A5F' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '700' },
          headerBackVisible: false,
          gestureEnabled: false,
          animation: 'slide_from_bottom',
        }}
      >
        {({ route, navigation }: any) => (
          <BookingConfirmScreen
            order={route.params.order}
            room={route.params.room}
            navigation={navigation}
            onBookAgain={() => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
              });
            }}
          />
        )}
      </RootStack.Screen>
    </RootStack.Navigator>
  );
}
