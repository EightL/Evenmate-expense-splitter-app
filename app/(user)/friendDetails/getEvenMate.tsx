// app/(user)/friendDetails/getEvenMate.tsx
import React, { useState } from 'react';
import { View, TextInput, Text, Pressable, StyleSheet } from 'react-native';
export default function GetEvenInput() {
  const [amount, setAmount] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Get Even with: Jakub L.</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Amount:</Text>
        <TextInput
          style={styles.input}
          placeholder="500,00"
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
        onPress={() => {
          if (amount.trim() !== '') {
            // Handle add action here
            // For now, we can just display an alert
            alert(`Added amount: ${amount}`);
            // Optionally, navigate back or reset the input
          }
        }}
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
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
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
    color: 'white',
    fontSize: 18,
  },
});