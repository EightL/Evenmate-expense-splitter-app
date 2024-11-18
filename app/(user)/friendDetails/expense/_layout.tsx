// app/(user)/expenseDetails/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import { Image, Pressable, StyleSheet } from 'react-native';
import evenmatelogo from '@/assets/images/Evenmatelogo_1.png';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

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
    marginRight: 0,
    resizeMode: 'cover',
    overflow: 'hidden',
  },
  backButton: {
    marginLeft: 15, // Adds spacing from the left edge
    padding: 5, // Increases the touchable area
  },
  pressedButton: {
    opacity: 0.5, // Provides visual feedback when pressed
  },
});