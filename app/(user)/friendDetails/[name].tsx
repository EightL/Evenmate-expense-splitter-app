// app/(user)/friendDetails/[name].tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Stack } from 'expo-router';

export default function FriendDetailScreen() {
  const router = useRouter();
  const { name, balance, group, bankAccount, email } = useLocalSearchParams();

  const handleGetEven = () => {
    router.push('/friendDetails/getEvenMate');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Mate'}} />
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.balance}>
        {Number(balance) > 0 ? `You lent: ${balance} CZK` : `You owe: ${balance} CZK`}
      </Text>
      <Text style={styles.detail}>Shared Group: {group}</Text>
      <Text style={styles.detail}>Bank Account: {bankAccount}</Text>
      <Text style={styles.detail}>Email: {email}</Text>

      <Pressable style={styles.button} onPress={handleGetEven}>
        <Text style={styles.buttonText}>Get Even</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'flex-start',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  balance: {
    fontSize: 20,
    marginBottom: 20,
  },
  detail: {
    fontSize: 18,
    marginBottom: 10,
  },
  button: {
    marginTop: 30,
    backgroundColor: '#4CAF50', // Green background
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%', // Make button full-width
    // Add shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // Elevation for Android
    elevation: 5,
  },
  buttonText: {
    color: '#fff', // White text
    fontSize: 18,
    fontWeight: 'bold',
  },
});