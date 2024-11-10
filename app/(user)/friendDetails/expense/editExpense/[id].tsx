// app/(user)/expenseDetails/edit/[id].tsx
import React, { useEffect, useState } from 'react';
import { View, TextInput, Text, Pressable, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useExpenseInfo, updateExpense } from '@/api/expenses';
import { useGetCurrentUserId } from '@/api/getCurrentUserId';
import { handleUpdateBalances } from '@/api/updateBalances';
import { useInvolvedPeople } from '@/api/involvedUsers';

type Expense = {
  id: string;
  name: string;
  amount: number;
  paid_by: string;
  created_at: string;
};

export default function EditExpenseScreen() {
  const router = useRouter();
  const { id, mateid } = useLocalSearchParams<{ id: string }>();
  const [expenseName, setExpenseName] = useState('');
  const [cost, setCost] = useState('');
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { data: currentUserId } = useGetCurrentUserId();
  const { data: mateIds } = useInvolvedPeople(id);

  const { data: expense, isLoading, error } = useExpenseInfo(id);

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

    try {
      setLoading(true);

      // Update expense details
      const result = await updateExpense(id, expenseName, numericCost);

      if (!result.success) {
        throw new Error(result.message);
      }

      // Update balances of involved users
      const changedAmount = numericCost - expense.amount;
      const share = changedAmount / mateIds?.length;

      await handleUpdateBalances({ currentUserId, mateIds, share });

      // Invalidate queries to refresh the data
      queryClient.invalidateQueries();
      queryClient.invalidateQueries({ queryKey: ['mates', currentUserId] });

      Alert.alert('Success', 'Expense updated successfully.');
      router.back();
      router.back();
      router.back();
    } catch (error: any) {
      console.error('Error updating expense:', error.message);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
    return <ActivityIndicator style={styles.loader} size="large" color="#0000ff" />;
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

      <Pressable style={styles.updateButton} onPress={handleUpdateExpense}>
        <Text style={styles.updateButtonText}>Update Expense</Text>
      </Pressable>
      <View style={styles.spacer} />
      <Pressable style={styles.deleteButton}>
        <Text style={styles.deleteButtonText}>Delete Expense</Text>
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
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
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
    marginBottom: 10,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  spacer: {
    flex: 1,
  },
});
