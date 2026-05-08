import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0f172a',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '900',
          marginBottom: 4,
        },
        tabBarStyle: {
          height: 88,
          paddingTop: 12,
          paddingBottom: 24,
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTitleStyle: {
          fontWeight: '900',
          fontSize: 18,
          color: '#0f172a',
        },
        headerShadowVisible: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerTitle: 'Multiplying Brics',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-sharp" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          headerTitle: 'Find Materials',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-sharp" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Inbox',
          headerTitle: 'Vendor Leads',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="mail-unread-sharp" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          headerTitle: 'My Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-sharp" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
