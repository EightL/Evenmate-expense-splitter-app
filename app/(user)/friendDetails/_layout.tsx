// app/(user)/friendDetails/_layout.tsx
import React from 'react';
import { Pressable, Alert, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase'; // Ensure this path is correct

export default function MatesStack() {
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

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Mates',
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
  pressedButton: {
    opacity: 0.5, // Provides visual feedback when pressed
  },
});