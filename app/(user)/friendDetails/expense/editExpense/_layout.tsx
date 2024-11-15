// app/(user)/expenseDetails/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';

export default function ExpenseDetailsStack() {
  return (
    <Stack>
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Edit Expense',
        }}
      />
    </Stack>
  );
}