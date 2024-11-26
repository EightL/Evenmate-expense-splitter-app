// app/(user)/expenseDetails/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import { Image, Pressable, StyleSheet, TouchableOpacity} from 'react-native';
import evenmatelogo from '@/assets/images/Evenmatelogo_1.png';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ExpenseDetailsStack() {
  const router = useRouter(); // Initialize the router

  return (
    <Stack>
      <Stack.Screen
      name="[id]"
      options={{
        title: 'Edit Expense',
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