// app/(user)/friendDetails/getEvenMate.tsx

import React, { useEffect, useState } from 'react';
import { View, TextInput, Text, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { handleUpdateBalances } from '@/api/updateBalances';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCurrentUserId } from '@/api/getCurrentUserId';
import { useGetBalance } from '@/api/getBalance';


export default function GetEvenInput() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { name, mateId, groupId } = useLocalSearchParams<{ name: string; mateId: string }>();
  const { data: currentUserId, error: currentUserError } = useGetCurrentUserId();

  const [amount, setAmount] = useState('');
  const { data: balance } = useGetBalance(currentUserId, mateId);

  useEffect(() => {
    if (balance?.balance) {
      setAmount((-parseFloat(balance.balance)).toString()); // Invert the balance sign here
    }
  }, [balance]);

  // console.log('groupId:', groupId);

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
        queryClient.invalidateQueries({ queryKey: ['groupMembersWithBalance', groupId] });

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
          value={Number(amount).toFixed(2)}
          onChangeText={setAmount}
          keyboardType="numeric"
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