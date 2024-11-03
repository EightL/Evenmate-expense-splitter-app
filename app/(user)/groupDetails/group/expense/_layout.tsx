import React from 'react';
import { Stack } from 'expo-router';

export default function ExpenseDetailsStack() {
  return (
    <Stack>
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Expense Details',
        }}
      />
        <Stack.Screen
        name="editExpense"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}