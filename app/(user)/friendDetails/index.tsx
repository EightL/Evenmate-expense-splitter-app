// app/(user)/friendDetails/index.tsx
import React from 'react';
import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router';
import Colors from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { Alert} from 'react-native';
import { useLocalSearchParams } from 'expo-router';

// Mock Data for mates
export const matesData = [
  { name: 'Jakub Lůčný', balance: -125.25, group: 'Italy Trip', bankAccount: 'CZ1234567890', email: 'jakub@example.com' },
  { name: 'Dejv Kotásek', balance: -125.25, group: 'No group', bankAccount: 'CZ0987654321', email: 'dejv@example.com' },
  { name: 'Lukáš Doleža', balance: 102.25, group: 'Italy Trip', bankAccount: 'CZ1122334455', email: 'lukas@example.com' },
  { name: 'Lukáš Dolež', balance: 102.25, group: 'Italy Trip', bankAccount: 'CZ1122334455', email: 'lukas@example.com' },
  { name: 'Lukáš Dole', balance: 102.25, group: 'Italy Trip', bankAccount: 'CZ1122334455', email: 'lukas@example.com' },
  { name: 'Lukáš Dol', balance: 102.25, group: 'Italy Trip', bankAccount: 'CZ1122334455', email: 'lukas@example.com' },
];

type Mate = {
  name: string;
  balance: number;
  group: string;
  bankAccount: string;
  email: string;
};

export default function MatesScreen() {
  const router = useRouter(); // Initialize the router

  const renderItem = ({ item }: { item: Mate }) => (
    <Pressable
      style={styles.shadowWrapper}
      onPress={() =>
        router.push({
          pathname: `/friendDetails/${encodeURIComponent(item.name)}`,
          params: {
            balance: item.balance,
            group: encodeURIComponent(item.group),
            bankAccount: encodeURIComponent(item.bankAccount),
            email: encodeURIComponent(item.email),
          },
        })
      }
    >
      <View style={styles.mateContainer}>
        <View style={styles.leftSection}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={item.balance > 0 ? styles.positiveBalance : styles.negativeBalance}>
            {item.balance > 0 ? `You lent: ${item.balance} CZK` : `You owe: ${item.balance} CZK`}
          </Text>
        </View>
        <Text style={styles.group}>{item.group}</Text>
      </View>
    </Pressable>
  );

  const handleAddNewMate = () => {
    router.push('/friendDetails/addNewMate');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Balance: 1000 CZK</Text>
      <FlatList
        data={matesData}
        keyExtractor={(item) => item.name}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
      <Pressable style={styles.button} onPress={handleAddNewMate}>
        <Text style={styles.buttonText}>Add new mate</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 10,
    textAlign: 'center',
  },
  // Shadow Wrapper for iOS and Android
  shadowWrapper: {
    width: '95%', // Controls the width of the shadow and container
    marginBottom: 20,
    borderRadius: 20,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // Elevation for Android
    elevation: 10,
  },
  mateContainer: {
    alignItems: 'center',
    justifyContent: 'space-between', // Distribute space between left and right
    flexDirection: 'row',
    width: '100%',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#D4F0DD',
  },
  leftSection: {
    flex: 1, // Take up available space
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  group: {
    fontSize: 14,
    color: 'black',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  positiveBalance: {
    color: 'green',
  },
  negativeBalance: {
    color: 'red',
  },
  button: {
    marginTop: 16,
    marginBottom: 15,
    backgroundColor: '#4CAF50', // Green background
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
    alignItems: 'center',
    width: '90%', // Make button full-width
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