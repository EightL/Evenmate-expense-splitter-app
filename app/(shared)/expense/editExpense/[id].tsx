// /app/(shared)/expense/editExpense/[id].tsx
// ITU Project, "Evenmate"
// Author(s): Martin Ševčík
// VUT FIT 2024

import React, { useEffect, useState } from 'react';
import { View, TextInput, Text, Pressable, StyleSheet, ScrollView, Alert, ActivityIndicator,} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useExpenseInfo, updateExpense, deleteExpense } from '@/api/expenses';
import { useGetCurrentUserId } from '@/api/getCurrentUserId';
import { handleUpdateBalances } from '@/api/updateBalances';
import { useInvolvedPeople } from '@/api/involvedUsers';

export default function EditExpenseScreen() {
  // States
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [expenseName, setExpenseName] = useState('');
  const [cost, setCost] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();
  const { data: currentUserId } = useGetCurrentUserId();
  const { data: mateIds } = useInvolvedPeople(id);
  const { data: expense, isLoading: isExpenseLoading, error } = useExpenseInfo(id);

  // Update the expense details
  useEffect(() => {
    if (expense) {
      setExpenseName(expense.name);
      setCost(expense.amount.toString());
    }
  }, [expense]);

  // Handle the deletion of the expense
  const handleDeleteExpense = async () => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this expense?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              
              // Delete the expense
              await deleteExpense(id);
              
              // Calculate the share to update balances
              const numericCost = parseFloat(cost);
              const share = -numericCost / (mateIds?.length || 1);
    
              // Update balances of involved users
              await handleUpdateBalances({ currentUserId, mateIds, share });
    
              // Invalidate queries to refresh data
              queryClient.invalidateQueries();
    
              // Navigate back after deletion
              router.back();
              router.back();
            } catch (error: any) {
              console.error('Error deleting expense:', error.message);
              Alert.alert('Error', error.message);
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Handle the update of the expense
  const handleUpdateExpense = async () => {
    if (!expenseName.trim() || !cost.trim()) {
      Alert.alert('Validation Error', 'Please enter both name and cost.');
      return;
    }

    // Validate the cost
    const numericCost = parseFloat(cost);
    if (isNaN(numericCost) || numericCost <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid cost.');
      return;
    }

    // Update the expense
    try {
      setIsUpdating(true);

      // Update expense details
      const result = await updateExpense(id, expenseName, numericCost);

      if (!result.success) {
        throw new Error(result.message);
      }

      // Update balances of involved users
      const changedAmount = numericCost - expense.amount;
      const share = changedAmount / (mateIds?.length || 1);

      await handleUpdateBalances({ currentUserId, mateIds, share });

      // Invalidate queries to refresh the data
      queryClient.invalidateQueries();
      queryClient.invalidateQueries({ queryKey: ['mates', currentUserId] });

      Alert.alert('Success', 'Expense updated successfully.');
      router.back();
      router.back();
    } catch (error: any) {
      console.error('Error updating expense:', error.message);
      Alert.alert('Error', error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Render the screen
  if (isExpenseLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator/>
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{`Error: ${error.message}`}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Render the expense details */}
      <Text style={styles.title}>Edit Expense Details</Text>
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

      {/* Update expense button */}
      <Pressable 
        style={[styles.updateButton, (isUpdating || isDeleting) && styles.buttonDisabled,]}
        onPress={handleUpdateExpense}
        disabled={isUpdating || isDeleting}
      >
        {isUpdating ? ( <ActivityIndicator/> ) : ( <Text style={styles.updateButtonText}>Update Expense</Text>)}
      </Pressable>

      <View style={styles.spacer} />
        
      {/* Delete expense button */}
      <Pressable
        style={[styles.deleteButton, (isUpdating || isDeleting) && styles.buttonDisabled,]}
        onPress={handleDeleteExpense}
        disabled={isUpdating || isDeleting}
      >
        {isDeleting ? ( <ActivityIndicator/> ) : (<Text style={styles.deleteButtonText}>Delete Expense</Text>)}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
    marginBottom: 10,
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
  buttonDisabled: {
    opacity: 0.7,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
});