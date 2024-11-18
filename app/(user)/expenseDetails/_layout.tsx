// app/(user)/friendDetails/_layout.tsx
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { handleLogout, handleAccount } from '@/lib/auth'; // Import the functions

export default function ExpenseStack() {
  const router = useRouter(); // Initialize the router

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Add expense',
          headerLeft: () => (
            <Pressable
              onPress={() => handleLogout(router)} // Wrap in an anonymous function
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
                color="#000" // Red color to signify logout
              />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable
              onPress={() => router.push('/expenseDetails/account')} // Wrap in an anonymous function
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
                color="#000" // Blue color for the account icon
              />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
      name="selectMates"
      options={{title: 'Select mates'}}
      />
      <Stack.Screen
      name="account"
      options={{
        headerShown: false,
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