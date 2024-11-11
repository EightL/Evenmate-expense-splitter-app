// app/(user)/friendDetails/[id].tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, FlatList } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Stack } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useSharedGroups } from '@/api/Rel_inGroup';
import { useGetCurrentUserId } from '@/api/getCurrentUserId';
import { deleteMateRelationship } from '@/api/mates';
import { useMateExpenses } from '@/api/expenses';
import { Alert } from 'react-native';
import { useQueryClient, InvalidateQueryFilters  } from '@tanstack/react-query';
import { useUserInfo } from '@/api/profiles';
import { useLayoutEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import * as Clipboard from 'expo-clipboard';

export default function FriendDetailScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id: mateId, name, balance, bankAccount, email } = useLocalSearchParams();
  const { data: mateData } = useUserInfo(mateId); // Isnt used but made something else work
  const navigation = useNavigation();
  
  // console.log("TADY balance: ", balance);
  
  // Get current user's ID
  const { data: currentUserId, error: error1 } = useGetCurrentUserId();

  // Use useSharedGroups hook
  const { data: sharedGroups, isLoading, error } = useSharedGroups(currentUserId, mateId);

  const { data: expensesList, error: error2 } = useMateExpenses(currentUserId, mateId);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => { handleRemoveFriend() }}
          style={{ marginRight: 15 }}
        >
          <Ionicons name="trash" size={24} color="#000" />
        </Pressable>
      ),
    });
  }, [navigation]);


  const handleGetEven = () => {
    router.push({
      pathname: `/friendDetails/getEvenMate`,
      params: {
        name: name,
        mateId: mateId,
        balance: balance,
      },
    })
  }

  const handleRemoveFriend = () => {
    Alert.alert(
      'Confirm Removal',
      `Are you sure you want to remove ${name} from your friends?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            
            queryClient.invalidateQueries({ queryKey: ['mates', currentUserId] });
            queryClient.invalidateQueries({ queryKey: ['mates', mateId] });

            const deletionSeccues = deleteMateRelationship(mateId, currentUserId);

            router.back();

          },
        },
      ],
      { cancelable: true }
    );
  };

  if (!currentUserId) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }


  type Expense = {
    id: string;
    name: string;
    amount: number;
    created_at: string;
    description: string;
    paid_by: string;
    involved_people: number;
  };

  const renderExpenses = ({ item }: { item: Expense }) => (

    <Pressable
      style={styles.expenseContainer}
      onPress={() =>
        router.push({
          pathname: `/friendDetails/expense/${encodeURIComponent(item.id)}`,
          params: {
            expid: item.id,
            mateid: mateId,
            name: item.name,
            time: item.time,
            description: item.description,
            paid_by: item.paid_by,
          },
        })
      }
    >

      <Text style={styles.expenseName}>{item.name}</Text>
      <Text style={styles.expenseDetail}>
        {item.paid_by === currentUserId
          ? `You lent: ${(item.amount / item.involved_people).toFixed(2)} CZK`
          : `You owe: ${(item.amount / item.involved_people).toFixed(2)} CZK`}
      </Text>
      <Text style={styles.expenseDetail}>Created at: {new Date(item.created_at).toLocaleString()}</Text>
    </Pressable>
  );

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied to Clipboard');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Mate' }} />
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.balance}>
        {Number(balance) >= 0 ? (
          <>
            You lent: <Text style={styles.numberPositive}>{Number(balance).toFixed(2)} CZK</Text>
          </>
        ) : (
          <>
            You owe: <Text style={styles.numberNegative}>{Number(balance).toFixed(2)} CZK</Text>
          </>
        )}
      </Text>
      <Pressable style={styles.detailContainer}  onPress={() => copyToClipboard(bankAccount)}>
        <Text style={styles.boldText}>Bank Account: </Text>
        <Text style={styles.detail}>{bankAccount}</Text>
      </Pressable>
      {/* Email */}
      <Pressable style={styles.detailContainer} onPress={() => copyToClipboard(email)}>
        <Text style={styles.boldText}>Email: </Text>
        <Text style={styles.detail}>{email}</Text>
      </Pressable>
      
      {/* Shared Groups */}
      <View style={styles.detailContainer}>
        <Text style={styles.boldText}>Shared Groups:</Text>
      </View>
      {isLoading ? (
        <ActivityIndicator size="small" color="#4CAF50" />
      ) : error ? (
        <Text>Error loading shared groups: {error.message}</Text>
      ) : sharedGroups && sharedGroups.length > 0 ? (
        <View style={styles.groupsContainer}>
          {sharedGroups.map((group) => (
            <View style={styles.groupBubble} key={group.id}>
              <Text style={styles.groupName}>{group.name}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.numberNegative}>No shared groups</Text>
      )}

      <Pressable style={styles.button} onPress={handleGetEven}>
        <Text style={styles.buttonText}>Get Even</Text>
      </Pressable>

      <Text style={styles.header}>Expenses</Text>
      <FlatList
        style={{ width: '100%' }}
        data={expensesList}
        keyExtractor={(item) => item.id}
        renderItem={renderExpenses}
        contentContainerStyle={styles.matesList}
      />
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
  groupsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  groupBubble: {
    backgroundColor: '#D4F0DD',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 5,
    marginBottom: 5,
  },
  header:{
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  balance: {
    fontSize: 20,
    marginBottom: 20,
    fontWeight: 'bold'
  },
  detail: {
    fontSize: 20,
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
  removeFriendButton: {
    marginTop: 15,
    paddingVertical: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
  },
  removeFriendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  groupName: {
    fontSize: 18,
    marginBottom: 5,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expenseContainer: {
    width: '100%',
    padding: 8,
    backgroundColor: '#D4F0DD',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  expenseName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  expenseDetail: {
    fontSize: 14,
    color: '#555',
  },
  detailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  boldText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  numberPositive: {
    color: 'green',
    fontWeight: 'bold',
    fontSize: 18,
  },
  numberNegative: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 18,
  },

});