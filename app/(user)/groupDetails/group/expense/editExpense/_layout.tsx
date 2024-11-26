import React from 'react';
import { Stack } from 'expo-router';
import { Image, TouchableOpacity } from 'react-native';
import evenmatelogo from '@/assets/images/Evenmatelogo_1.png';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';


export default function ExpenseDetailsStack() {
  const router = useRouter();
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
              color="#4CAF50" // Blue color
              />
          </TouchableOpacity>
          ),
        }}
      />
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

});