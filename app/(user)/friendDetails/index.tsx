// app/(user)/friendDetails/index.tsx
import React, {useMemo} from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Link, useRouter, useLocalSearchParams } from 'expo-router';
import Colors from '@/constants/Colors';
import { useMatesList } from '@/api/mates';


export default function MatesScreen() {
  const router = useRouter(); // Initialize the router

  const { data: matesData, error, isLoading} = useMatesList();

  // Calculate total balance using useMemo
  const totalBalance = useMemo(() => {
    return matesData?.reduce((sum, item) => sum + (item.balance || 0), 0) || 0;
  }, [matesData]);

  if (isLoading) {
    return <ActivityIndicator />;
  }
  
  if (error) {
    return <Text> Failed to load mates </Text>;
  }
  
  type Mate = {
    balance: number;
    user1: string;
    user2: string;
    profiles: {
      username: string;
      email: string;
      bank_account: string;
    };
    groups: {
      id: string;
      name: string;
    };
  };

  const renderItem = ({ item }: { item: Mate }) => (
    <Pressable
      style={styles.shadowWrapper}
      onPress={() =>
        router.push({
          pathname: `/friendDetails/${encodeURIComponent(item.user2)}`,
          params: {
            mateId: item.user2,
            name: item.profiles.username,
            balance: item.balance.toFixed(2),
            // group: encodeURIComponent(item.name),
            bankAccount: item.profiles.bank_account,
            email: item.profiles.email,
          },
        })
      }
    >
        <View style={styles.mateContainer}>
        <Text style={styles.name}>{item.profiles.username}</Text>
        <Text style={item.balance >= 0 ? styles.positiveBalance : styles.negativeBalance}>
          {item.balance > 0 ? `You lent: ${item.balance.toFixed(2)} CZK` : `You owe: ${-item.balance.toFixed(2)} CZK`}
        </Text>
      </View>
    </Pressable>
  );

  const handleAddNewMate = () => {
    router.push('/friendDetails/addNewMate');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Balance: {totalBalance.toFixed(2)} CZK</Text>
      <FlatList
        data={matesData}
        keyExtractor={(item) => item.profiles.username}
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
  shadowWrapper: {
    marginBottom: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 10,
    width: '100%', // Ensuring the shadow wrapper takes full width
  },
  mateContainer: {
    alignItems: 'flex-start', // Align items to the left
    flexDirection: 'column',
    width: '100%', // Full width of the parent container
    padding: 20,
    paddingHorizontal: 95,
    borderRadius: 10,
    backgroundColor: '#D4F0DD',
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
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
    alignItems: 'center',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});