// app/(user)/friendDetails/_layout.tsx
import React from 'react';
import { Pressable, StyleSheet, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { FontAwesome, Ionicons } from '@expo/vector-icons';

import evenmatelogo from '@/assets/images/Evenmatelogo_1.png';

export default function ExpenseStack() {
  const router = useRouter(); // Initialize the router

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Account',
          headerTitleAlign: 'center', // Center the title
          headerRight: () => (
            <Pressable
              onPress={() => router.push('/friendDetails/account/accountSettings')} // Wrap in an anonymous function
              style={({ pressed }) => [
                styles.accountButton,
                pressed && styles.pressedButton,
              ]}
              accessibilityLabel="Account"
              accessibilityRole="button"
            >
              <Ionicons
                name="settings"
                size={25}
                color="#000" // Blue color for the account icon
              />
            </Pressable>
          ),
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.pressedButton,
              ]}
              accessibilityLabel="Go Back"
              accessibilityRole="button"
            >
              <FontAwesome
                name="arrow-left"
                size={25}
                color="#007AFF" // Blue color for back button
              />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
      name="accountSettings"
      options={{
        title: 'Account Settings',
        headerRight: () => (
            <Image source={evenmatelogo} style={styles.evenmatelogo} />
          ),
        headerLeft: () => (
        <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressedButton,
            ]}
            accessibilityLabel="Go Back"
            accessibilityRole="button"
        >
            <FontAwesome
            name="arrow-left"
            size={25}
            color="#007AFF" // Blue color for back button
            />
        </Pressable>
        ),
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
  evenmatelogo: {
    width: 33,
    height: 27,
    marginRight: 0,
    resizeMode: 'cover',
    overflow: 'hidden',
  },
  backButton: {
    marginLeft: 15, // Adds spacing from the left edge
    padding: 5, // Increases the touchable area
  },
});