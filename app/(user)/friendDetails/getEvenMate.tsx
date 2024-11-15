// app/(user)/friendDetails/getEvenMate.tsx

import React, { useEffect, useState } from 'react';
import { View, TextInput, Text, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { handleUpdateBalances } from '@/api/updateBalances';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCurrentUserId } from '@/api/getCurrentUserId';

export default function GetEvenInput() {
  const router = useRouter();
  const { name, mateId, balance } = useLocalSearchParams<{ name: string; mateId: string; balance: string }>();
  const [amount, setAmount] = useState('');
  const { data: currentUserId, error: currentUserError } = useGetCurrentUserId();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (balance) {
      setAmount((-parseFloat(balance)).toString()); // Invert the balance sign here
    }
  }, [balance]);

  // console.log('balance:', balance); // Should now log the correct balance

  const handleAdd = async () => {
    if (amount.trim() !== '') {
      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount)) {
        Alert.alert('Invalid Amount', 'Please enter a valid number.');
        return;
      }

      try {
        await handleUpdateBalances({
          currentUserId: currentUserId!,
          mateIds: [mateId],
          share: numericAmount,
        });
        queryClient.invalidateQueries({ queryKey: ['mates', currentUserId] });
        queryClient.invalidateQueries({ queryKey: ['mates', mateId] });

        router.back();
        router.back();
      } catch (error: any) {
        console.error('Error updating balance:', error.message);
        Alert.alert('Error', error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Get Even with: {name}</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Amount:</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          value={amount}
          onChangeText={setAmount}
        />
        <Text style={styles.currency}>CZK</Text>
      </View>
      <Pressable
        style={[styles.button, amount.trim() === '' && styles.buttonDisabled]}
        onPress={handleAdd}
        disabled={amount.trim() === ''}
      >
        <Text style={styles.buttonText}>Add</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginRight: 10,
  },
  input: {
    flex: 1,
    borderColor: '#4CAF50',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
  },
  currency: {
    marginLeft: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#a5d6a7',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});