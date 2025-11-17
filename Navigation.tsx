// src/navigation/Navigation.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import DashboardScreen from '../screens/DashboardScreen';
import ProjectsScreen from '../screens/ProjectsScreen';
import ClientsScreen from '../screens/ClientsScreen';
import FinancesScreen from '../screens/FinancesScreen';
import DocumentsScreen from '../screens/DocumentsScreen';
import ScheduleScreen from '../screens/ScheduleScreen';

import { useAuth } from '../auth/AuthContext';

const Tab = createBottomTabNavigator();

const Navigation = () => {
  const { user, loading } = useAuth();

  if (loading) {
    // Show a loading screen while authentication status is being determined
    return null; // In a real app, you'd show a proper loading component
  }

  // If user is not authenticated, show login screen
  if (!user) {
    // For now, returning a simple placeholder since we don't have login screen yet
    return null; // In a real app, redirect to login screen
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: string = 'home';

            if (route.name === 'Dashboard') {
              iconName = focused ? 'dashboard' : 'dashboard-outline';
            } else if (route.name === 'Projects') {
              iconName = focused ? 'folder' : 'folder-outline';
            } else if (route.name === 'Clients') {
              iconName = focused ? 'people' : 'people-outline';
            } else if (route.name === 'Finances') {
              iconName = focused ? 'account-balance-wallet' : 'account-balance-wallet';
            } else if (route.name === 'Documents') {
              iconName = focused ? 'description' : 'description';
            } else if (route.name === 'Schedule') {
              iconName = focused ? 'calendar-today' : 'calendar-today';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings';
            }

            // @ts-ignore - MaterialIcons has many icons
            return <MaterialIcons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#0066CC',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen 
          name="Dashboard" 
          component={DashboardScreen} 
          options={{ headerShown: false }} 
        />
        <Tab.Screen 
          name="Projects" 
          component={ProjectsScreen} 
          options={{ headerShown: false }} 
        />
        <Tab.Screen 
          name="Clients" 
          component={ClientsScreen} 
          options={{ headerShown: false }} 
        />
        <Tab.Screen 
          name="Finances" 
          component={FinancesScreen} 
          options={{ headerShown: false }} 
        />
        <Tab.Screen 
          name="Documents" 
          component={DocumentsScreen} 
          options={{ headerShown: false }} 
        />
        <Tab.Screen 
          name="Schedule" 
          component={ScheduleScreen} 
          options={{ headerShown: false }} 
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;