// app/(user)/expenseDetails/index.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { handleUpdateBalances } from '@/api/updateBalances';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCurrentUserId } from '@/api/getCurrentUserId';
import { createExpense, insertRelOwesFor } from '@/api/expenses';

export default function AddExpenseScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const queryClient = useQueryClient();

  // Initialize state with params if available
  const [expenseName, setExpenseName] = useState(params.expenseName || '');
  const [cost, setCost] = useState(params.cost || '');
  const [selectedMates, setSelectedMates] = useState<
    { id: string; name: string }[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get current user ID
  const { data: currentUserId, error } = useGetCurrentUserId();

  useEffect(() => {
    if (params.mateIds && params.mateNames) {
      // Handle both string and array inputs
      const mateIdsArray =
        typeof params.mateIds === 'string'
          ? params.mateIds.split(',')
          : params.mateIds;
      const mateNamesArray =
        typeof params.mateNames === 'string'
          ? params.mateNames.split(',')
          : params.mateNames;

      const mates = mateIdsArray.map((id: string, index: number) => ({
        id,
        name: mateNamesArray[index],
      }));

      // Prevent setting state if mates are already selected
      const isSameLength = mates.length === selectedMates.length;
      const isSameMates =
        isSameLength &&
        mates.every(
          (mate, idx) =>
            mate.id === selectedMates[idx]?.id &&
            mate.name === selectedMates[idx]?.name
        );
      if (!isSameMates) {
        setSelectedMates(mates);
      }
    }
  }, [params.mateIds, params.mateNames]);

  const handleAddMates = () => {
    // Reset the form
    setExpenseName('');
    setCost('');
    setSelectedMates([]);

    router.push({
      pathname: '/expenseDetails/selectMates',
      params: {
        expenseName,
        cost,
      },
    });
  };

  // Updated handleSubmitExpense function with ActivityIndicator in the button
  const handleSubmitExpense = async () => {
    // Input validation
    if (!expenseName.trim() || !cost.trim()) {
      Alert.alert('Validation Error', 'Please enter both expense name and cost.');
      return;
    }
    
    const numericCost = parseFloat(cost);
    if (isNaN(numericCost) || numericCost <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid cost.');
      return;
    }
    
    try {
      setIsSubmitting(true);

      const participantCount = selectedMates.length + 1; // Including the current user
      const share = numericCost / participantCount;
      const mateIds = selectedMates.map((mate) => mate.id);

      // Update balances
      await handleUpdateBalances({
        currentUserId,
        mateIds,
        share,
      });

      // Create the expense and get the expense ID
      const expenseId = await createExpense({
        expenseName,
        numericCost,
        currentUserId,
        groupId: params.groupId,
        participantCount,
      });

      // Insert into Rel_owesFor for each mate
      await insertRelOwesFor(expenseId, mateIds);

      // Reset query keys
      queryClient.invalidateQueries({ queryKey: ['mates', currentUserId] });
      queryClient.invalidateQueries({ queryKey: ['groupExpenses', params.groupId] });

      for (const mate of selectedMates) {
        queryClient.invalidateQueries({ queryKey: ['mateExpenses', currentUserId, mate] });
      }
      
      // Reset the form
      setExpenseName('');
      setCost('');
      setSelectedMates([]);

      Alert.alert('Success', 'Expense added successfully.');
      router.back();
    } catch (error: any) {
      console.error('Error submitting expense:', error.message);
      Alert.alert('Error', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Expense</Text>
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
      <View style={styles.splitWithContainer}>
        <Text style={styles.splitWithText}>Split with:</Text>
        <View style={styles.matesContainer}>
          {selectedMates.map((mate) => (
            <View key={mate.id} style={styles.mateBubble}>
              <Text style={styles.mateName}>{mate.name}</Text>
            </View>
          ))}
          <Pressable style={styles.addButton} onPress={handleAddMates}>
            <Text style={styles.addButtonText}>+</Text>
          </Pressable>
        </View>
      </View>
      <Pressable
        style={[
          styles.submitButton,
          (!expenseName || !cost || selectedMates.length === 0 || isSubmitting) && styles.submitButtonDisabled,
        ]}
        onPress={handleSubmitExpense}
        disabled={!expenseName || !cost || selectedMates.length === 0 || isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Submit Expense</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
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
  splitWithContainer: {
    marginBottom: 20,
  },
  splitWithText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  }, 
  matesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  mateBubble: {
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 5,
    marginBottom: 5,
  },
  mateName: {
    color: '#fff',
    fontSize: 14,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 20,
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});