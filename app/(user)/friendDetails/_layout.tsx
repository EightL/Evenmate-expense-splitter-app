// app/(user)/friendDetails/_layout.tsx
import React from 'react';
import { Pressable, Alert, StyleSheet, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase'; // Ensure this path is correct
import { handleLogout, handleAccount } from '@/lib/auth'; // Import the functions
import evenmatelogo from '@/assets/images/Evenmatelogo_1.png'; // Import the Evenmate logo
import { styles } from '@/constants/styles';

export default function MatesStack() {
  const router = useRouter(); // Initialize the router

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Mates',
          headerTitleAlign: 'center', // Center the title
          headerLeft: () => (
            <Image source={evenmatelogo} style={styles.evenmatelogo}></Image>
          ),
          headerRight: () => (
            <Pressable
              onPress={() => router.push('/friendDetails/account')} // Navigate to the account screen
              style={({ pressed }) => [
                styles.accountButton,
                pressed && styles.pressedButton,
              ]}
              accessibilityLabel="Account"
              accessibilityRole="button"
            >
              <FontAwesome
                name="user"
                size={25}
                color="#000"
              />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name="getEvenMate"
        options={{
          title: 'Get Even',
        }}
      />
      <Stack.Screen
        name="expense"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
      name="account"
      options={{
        headerShown : false,
        title: 'Account',
      }}/>
      <Stack.Screen
      name="[id]"
      options={{
        title: 'Mate',
      }}/>
    </Stack>
  );
}
