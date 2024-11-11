// app/(user)/friendDetails/_layout.tsx
import React from 'react';
import { Pressable, Alert, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase'; // Ensure this path is correct
import { handleLogout, handleAccount } from '@/lib/auth';

export default function GroupsStack() {
  const router = useRouter(); // Initialize the router



  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Groups',
          headerLeft: () => (
            <Pressable
              onPress={() => handleLogout(router)} // Use the handleLogout function
              style={({ pressed }) => [
                styles.logoutButton,
                pressed && styles.pressedButton,
              ]}
              accessibilityLabel="Logout"
              accessibilityRole="button"
            >
              <FontAwesome
                name="sign-out"
                size={25}
                color="#FF3B30" // Red color to signify logout
              />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable
              onPress={() => router.push('/groupDetails/account')} // Use the router to navigate to the account screen
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
                color="#007AFF" // Blue color for the account icon
              />
            </Pressable>
          ),
        }}
      />
        <Stack.Screen
        name="group"
        options={{
          headerShown: false,
        }}/>
        <Stack.Screen
        name="createGroup"
        options={{
          title: 'Create Group',
        }}/>
        <Stack.Screen
        name="joinGroup"
        options={{
          title: 'Join Group',
        }}/>
        <Stack.Screen
        name="account"
        options={{
          title: 'Account',
        }}/>
    </Stack>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    marginLeft: 15, // Adds spacing from the left edge
    padding: 5, // Increases the touchable area
  },
  accountButton: {
    marginRight: 15, // Adds spacing from the right edge
    padding: 5,
  },
  pressedButton: {
    opacity: 0.5, // Provides visual feedback when pressed
  },
});