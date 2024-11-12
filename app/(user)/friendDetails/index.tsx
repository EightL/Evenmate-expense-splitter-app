// app/(user)/friendDetails/index.tsx
import React, { useMemo, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Link, useRouter, useLocalSearchParams } from 'expo-router';
import Colors from '@/constants/Colors';
import { useMatesList } from '@/api/mates';
import { supabase } from '@/lib/supabase';
import { useGetCurrentUserId } from '@/api/getCurrentUserId';

export default function MatesScreen() {
  const router = useRouter(); // Initialize the router

  // State to store the current user ID
  const [refreshing, setRefreshing] = useState(false);

  // Retrieve the current user ID
  const { data: currentUserId, error: currentUserError } = useGetCurrentUserId();

  const { data: matesData, error, isLoading } = useMatesList(currentUserId);

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
        <View style={styles.balanceContainer}>
          <Text style={item.balance >= 0 ? styles.positiveBalance : styles.negativeBalance}>
            {item.balance >= 0 ? 'You lent:' : 'You owe:'}
          </Text>
          <Text style={item.balance >= 0 ? styles.positiveBalance : styles.negativeBalance}>
            {item.balance >=0 ? `${item.balance.toFixed(2)} CZK` : `${item.balance.toFixed(2)} CZK`}
          </Text>
        </View>
      </View>
    </Pressable>
  );

  const handleAddNewMate = () => {
    router.push('/friendDetails/addNewMate');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Overall Balance: {Number(totalBalance) >= 0 ? (
          <>
            <Text style={styles.numberPositive}>{Number(totalBalance).toFixed(2)} CZK</Text>
          </>
        ) : (
          <>
            <Text style={styles.numberNegative}>{Number(totalBalance).toFixed(2)} CZK</Text>
          </>
        )}</Text>
      <FlatList
        data={matesData}
        keyExtractor={(item) => item.profiles.username}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
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
    padding: 20,
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
    shadowOffset: { width: 0, height: 1 }, // Adjusted to reduce the downward stretch
    shadowOpacity: 0.15, // Reduced opacity for a subtler shadow
    shadowRadius: 3, // Reduced radius for a tighter shadow
    elevation: 5, // Reduced elevation for a subtler shadow on Android
    width: '100%', // Ensuring the shadow wrapper takes full width
  },
  mateContainer: {
    flexDirection: 'row', // Align items in a row
    justifyContent: 'space-between', // Space between items
    alignItems: 'center', // Center items vertically
    width: '100%', // Full width of the parent container
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#D4F0DD',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 3, // Take 3/4 of the space
  },
  balanceContainer: {
    flex: 2, // Take 1/4 of the space
    alignItems: 'flex-end', // Align items to the right
  },
  positiveBalance: {
    color: 'green',
    fontSize: 16,
    textAlign: 'right', // Align text to the right
    fontWeight: 'bold',
  },
  negativeBalance: {
    color: 'red',
    fontSize: 16,
    textAlign: 'right', // Align text to the right
    fontWeight: 'bold'
  },
  listContainer: {
    paddingBottom: 100, // Add padding to avoid content being hidden behind buttons
  },
  button: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    // Shadow for buttons
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  numberPositive: {
    color: 'green',
    fontWeight: 'bold',
    fontSize: 24,
  },
  numberNegative: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 24,
  },

});