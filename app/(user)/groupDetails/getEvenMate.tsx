// app/(user)/friendDetails/getEvenMate.tsx
import React, { useState } from 'react';
import { View, TextInput, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { handleUpdateBalances } from '@/api/updateBalances'; // Adjust the import path if necessary

export default function GetEvenInput() {
  const [amount, setAmount] = useState('');
  const router = useRouter();
  const { name, mateId: mateId } = useLocalSearchParams();

  const handleAdd = async () => {
    if (amount.trim() !== '') {
      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount)) {
        Alert.alert('Invalid Amount', 'Please enter a valid number.');
        return;
      }

      try {
        // Get current user ID
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) {
          Alert.alert('Error', userError.message);
          return;
        }
        const currentUserId = user.id;

        // Update balances
        console.log("MATE ID:", mateId)
        await handleUpdateBalances({
          currentUserId,
          mateIds: [mateId],
          share: numericAmount,
        });

        Alert.alert('Success', 'Balance updated successfully.');
        // Optionally, navigate back or reset the input
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
          placeholder="500.00"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
        <Text style={styles.currency}>Kč</Text>
      </View>

      {/* Additional fields like date and comments */}

      <Pressable
        style={[
          styles.button,
          amount.trim() === '' && styles.buttonDisabled,
        ]}
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
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  label: {
    fontSize: 18,
    marginRight: 10,
  },
  input: {
    borderBottomWidth: 1,
    fontSize: 24,
    padding: 5,
    flex: 1,
    textAlign: 'center',
  },
  currency: {
    fontSize: 18,
    marginLeft: 10,
  },
  button: {
    marginTop: 20,
    backgroundColor: 'green',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: 'rgba(0,128,0,0.3)', // Semi-transparent green
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});