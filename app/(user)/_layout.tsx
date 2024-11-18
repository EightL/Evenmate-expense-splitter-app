// app/(user)/_layout.tsx
import React from 'react';
// Icons import
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Octicons from '@expo/vector-icons/Octicons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

import { Link, Redirect, Tabs } from 'expo-router';
import { Pressable, View } from 'react-native';

import Colors from '@/constants/Colors';
// import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useAuth } from '@/providers/AuthProvider';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

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
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}>

      <Tabs.Screen name="index" options={{ href: null}} />

      <Tabs.Screen
        name="friendDetails"
        options={{
          title: 'Mates',
          headerShown: false,
          tabBarIcon: ({ color }) => <Octicons name="person-fill" size={24} color="#000" />,
          // headerRight: () => (
          //   <Link href="/modal" asChild>
          //     <Pressable>
          //       {({ pressed }) => (
          //         <FontAwesome
          //           name="info-circle"
          //           size={25}
          //           color={Colors[colorScheme ?? 'light'].text}
          //           style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
          //         />
          //       )}
          //     </Pressable>
          //   </Link>
          // ),
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
