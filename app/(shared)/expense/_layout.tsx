// /app/(shared)/expense/_layout.tsx
// ITU Project, "Evenmate"
// Author(s): Martin Ševčík
// VUT FIT 2024

import React from 'react';
import { Stack } from 'expo-router';
import { Image, Pressable, StyleSheet } from 'react-native';
import evenmatelogo from '@/assets/images/Evenmatelogo_1.png';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

export default function ExpenseDetailsStack() {
  const router = useRouter(); // Initialize the router

  return (
    <Stack>
      <Stack.Screen
      name="[id]"
      options={{
        title: 'Expense',
        headerRight: () => (
            <Image source={evenmatelogo} style={styles.evenmatelogo} />
          ),
        headerLeft: () => (
        <TouchableOpacity
            onPress={() => router.back()}
            accessibilityLabel="Go Back"
            accessibilityRole="button"
        >
            <Ionicons
            name='arrow-back'
            size={30}
            color="#4CAF50" // Blue color for back button
            />
        </TouchableOpacity>
        ),
      }}/>
      <Stack.Screen
      name="editExpense"
      options={{
        headerShown: false,
      }}/>
    </Stack>
  );
}

const styles = StyleSheet.create({
  evenmatelogo: {
    width: 33,
    height: 27,
    resizeMode: 'cover',
    overflow: 'hidden',
  },
  pressedButton: {
    opacity: 0.5, // Provides visual feedback when pressed
  },
});