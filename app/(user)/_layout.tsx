// /app/(user)/_layout.tsx
// ITU Project, "Evenmate"
// Author(s): Jakub Lůčný, Martin Ševčík
// VUT FIT 2024

import React from 'react';
// Icons import
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Octicons from '@expo/vector-icons/Octicons';
import { Redirect, Tabs } from 'expo-router';
import {  View } from 'react-native';
// import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useAuth } from '@/providers/AuthProvider';

export default function TabLayout() {
  // const colorScheme = useColorScheme();
  const {session} = useAuth();

  if (!session){
    return <Redirect href={'/'} />
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#000000",
        headerShown: useClientOnlyValue(false, true),
      }}>

      <Tabs.Screen name="index" options={{ href: null}} />

      <Tabs.Screen
        name="friendDetails"
        options={{
          title: 'Mates',
          headerShown: false,
          tabBarIcon: ({ color }) => <Octicons name="person-fill" size={24} color="#000" />,
        }}
      />
      <Tabs.Screen
        name="expenseDetails"
        options={{
          title: 'Add expense',
          headerShown: false,
          tabBarIcon: ({ color }) => <View>
            <FontAwesome name="plus" size={30} color="#000" />
          </View>,
        }}
      />
      <Tabs.Screen
        name="groupDetails"
        options={{
          title: 'Groups',
          headerShown: false,
          tabBarIcon: ({ color }) => <FontAwesome name="group" size={24} color="#000"/>,
        }}
      />
      
    </Tabs>
  );
}
