import React from 'react';
import { Stack } from 'expo-router';

export default function ExpenseDetailsStack() {
  return (
    <Stack>
      <Stack.Screen
        name="[id]"
        options={{
          title: 'To-Do details',
        }}
      />
    </Stack>
  );
}