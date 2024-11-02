// app/(user)/friendDetails/_layout.tsx
import React from 'react';
import { Pressable, Alert, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase'; // Ensure this path is correct

export default function GroupsStack() {
  const router = useRouter(); // Initialize the router
  
  // Handle Logout Function
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              const { error } = await supabase.auth.signOut();
              if (error) {
                // Handle sign-out error
                Alert.alert('Error', error.message);
              } else {
                // Navigate to the sign-in screen
                router.push('/sign-in');
              }
            } catch (err) {
              // Handle unexpected errors
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleAccount = () => {
    // Navigate to the account screen
    router.push('/groupDetails/account');
  };

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Groups',
          headerLeft: () => (
            <Pressable
              onPress={handleLogout} // Use the handleLogout function
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
              onPress={handleAccount}
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