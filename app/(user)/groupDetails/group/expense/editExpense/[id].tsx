// app/(user)/expenseDetails/edit/[id].tsx
import React, { useEffect, useState } from 'react';
import { View, TextInput, Text, Pressable, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';

type Expense = {
  id: string;
  name: string;
  amount: number;
  paid_by: string;
  created_at: string;
};

export default function EditExpenseScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [expenseName, setExpenseName] = useState('');
  const [cost, setCost] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        const { data, error } = await supabase
          .from('Expenses')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setExpenseName(data.name);
        setCost(data.amount.toString());
      } catch (error: any) {
        console.error('Error fetching expense:', error.message);
        Alert.alert('Error', error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpense();
  }, [id]);

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
      const { error } = await supabase
        .from('Expenses')
        .update({
          name: expenseName,
          amount: numericCost,
        })
        .eq('id', id);

      if (error) throw error;

      Alert.alert('Success', 'Expense updated successfully.');
      router.back();
    } catch (error: any) {
      console.error('Error updating expense:', error.message);
      Alert.alert('Error', error.message);
    }
  };

  if (isLoading) {
    return <ActivityIndicator style={styles.loader} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Edit Expense</Text>
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