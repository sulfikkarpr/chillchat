/**
 * ChillChat - Bluetooth Chat App
 * React Native App with Bluetooth Classic connectivity
 *
 * @format
 */

import React, { useEffect } from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ProfileProvider, useProfile } from './contexts/ProfileContext';
import { runAllTests } from './utils/storageTest';
import { runQuickTest } from './utils/comprehensiveTest';
import { runAllNavigationTests } from './utils/navigationTester';

import ProfileScreen from './screens/ProfileScreen';
import HomeScreen from './screens/HomeScreen';
import ChatListScreen from './screens/ChatListScreen';
import ChatScreen from './screens/ChatScreen';
import SettingsScreen from './screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#666666',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Discover" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Discover',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 20, color }}>🔍</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Chats" 
        component={ChatListScreen}
        options={{
          tabBarLabel: 'Chats',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 20, color }}>💬</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 20, color }}>⚙️</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { profile, loading } = useProfile();

  // Debug logging
  console.log('🔍 AppNavigator - Profile state:', {
    loading,
    isProfileSetup: profile.isProfileSetup,
    nickname: profile.nickname,
    initialRoute: profile.isProfileSetup ? "Main" : "Profile"
  });

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={profile.isProfileSetup ? "Main" : "Profile"}
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="Main" 
          component={TabNavigator}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen 
          name="Chat" 
          component={ChatScreen}
          options={({ route }) => ({
            title: route.params?.device?.name || 'Chat',
            headerBackTitleVisible: false,
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

function App(): React.JSX.Element {
  useEffect(() => {
    // Run comprehensive testing suite on app start
    setTimeout(async () => {
      console.log('🚀 Starting ChillChat Comprehensive Testing Suite...');
      console.log('=' * 60);
      
      // Run storage tests
      console.log('📱 1. Running Storage Tests...');
      await runAllTests();
      
      // Run comprehensive functionality tests  
      console.log('\n🧪 2. Running Comprehensive Tests...');
      await runQuickTest();
      
      // Run navigation test definitions
      console.log('\n🧭 3. Loading Navigation Tests...');
      runAllNavigationTests();
      
      console.log('\n🎉 All automated tests completed!');
      console.log('📝 Check console for detailed test results');
      console.log('🧭 Manual navigation testing ready');
      console.log('=' * 60);
    }, 3000); // Increased timeout to allow app to fully load
  }, []);

  return (
    <SafeAreaProvider>
      <ProfileProvider>
        <AppNavigator />
      </ProfileProvider>
    </SafeAreaProvider>
  );
}

export default App;
