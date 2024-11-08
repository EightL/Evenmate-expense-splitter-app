// app/(user)/expenseDetails/edit/[id].tsx
import React, { useEffect, useState } from 'react';
import { View, TextInput, Text, Pressable, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useQueryClient, InvalidateQueryFilters  } from '@tanstack/react-query';
import { useExpenseInfo, updateExpense } from '@/api/expenses';
import { useGetCurrentUserId } from '@/api/getCurrentUserId';

type Expense = {
  id: string;
  name: string;
  amount: number;
  paid_by: string;
  created_at: string;
};

export default function EditExpenseScreen() {
  const router = useRouter();
  const { id, mateid} = useLocalSearchParams<{ id: string }>();
  const [expenseName, setExpenseName] = useState('');
  const [cost, setCost] = useState('');
  const queryClient = useQueryClient();
  const { data: currentUserId, error: currentUserIdError } = useGetCurrentUserId();

  // Use the custom hook to fetch expense data
  const {
    data: expense,
    isLoading,
    isError,
    error,
  } = useExpenseInfo(id);

  useEffect(() => {
    if (expense) {
      setExpenseName(expense.name);
      setCost(expense.amount.toString());
    }
  }, [expense]);

  const handleUpdateExpense = async () => {
    if (!expenseName.trim() || !cost.trim()) {
      Alert.alert('Validation Error', 'Please enter both name and cost.');
      return;
    }

    const numericCost = parseFloat(cost);
    if (isNaN(numericCost) || numericCost <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid cost.');
      return;
    }

    const result = await updateExpense(id, expenseName, numericCost);

    if (result.success) {
      Alert.alert('Success', 'Expense updated successfully.');
      router.back();
      // queryClient.invalidateQueries({ queryKey: ['mateExpenses', currentUserId, mateid] });
      // console.log("CURRENT USER ID: ", currentUserId);
      await queryClient.invalidateQueries();
      queryClient.invalidateQueries({ queryKey: ['mates', currentUserId] });

    } else {
      console.error('Error updating expense:', error.message);
      Alert.alert('Error', result.message);
    }
  };

  if (isLoading) {
    return <ActivityIndicator style={styles.loader} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Edit expense details</Text>
      <TextInput
        style={styles.input}
        placeholder="Expense Name"
        value={expenseName}
        onChangeText={setExpenseName}
      />
      <TextInput
        style={styles.input}
        placeholder="Cost"
        value={cost}
        onChangeText={setCost}
        keyboardType="numeric"
      />
      {/* Add additional fields as needed */}
      <Pressable style={styles.updateButton} onPress={handleUpdateExpense}>
        <Text style={styles.updateButtonText}>Update Expense</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    marginTop: 10,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    borderColor: '#4CAF50',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  updateButton: {
    backgroundColor: '#5AC07C',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});