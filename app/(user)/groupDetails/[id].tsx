// app/(user)/groupDetails/[id].tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, FlatList } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Stack } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useSharedGroups } from '@/api/Rel_inGroup';
import { useExpensesList } from '@/api/expenses';
import { useGroupMembers } from '@/api/groups';


export default function GroupDetailScreen() {
  const router = useRouter();
  const {id: groupId, name, notes } = useLocalSearchParams();

  const handleGetEven = () => {
    router.push({
      pathname: '/groupDetails/getEvenGroup',
      params: {
        groupId,
        name,
      },
    });
  };

  const handleNotes = () => {
    router.push('/groupsDetails/groupNotes');
  };

  const handleOverview = () => {
    router.push('/groupsDetails/groupOverview');
  };


  const { data: expensesData, error, isLoading} = useExpensesList();
  const { data: groupMembers, error: error2} = useGroupMembers(groupId);

  if (isLoading) {
    return <ActivityIndicator />;
  }
  
  if (error) {
    return <Text> Failed to load expenses </Text>;
  }

  if (error2) {
    return <Text> Failed to load group members </Text>;
  }
  
  type groupMember = {
    username: string;
    id: string;
    profiles: {
      username: string;
    }
  };
  

  type Expense = {
    id: string;
    name: string;
    amount: number;
    time: string;
    description: string;
    paid_by: string;
  };
  
  const renderExpenses = ({ item }: { item: Expense }) => (
    <Pressable
      style={styles.expenseContainer}
      onPress={() =>
        router.push({
          pathname: `/groupDetails/expense/${encodeURIComponent(item.id)}`,
          params: {
            expid: item.id,
            name: item.name,
            time: item.time,
            description: item.description,
            paid_by: item.paid_by,
          },
        })
      }
    >
      <Text style={styles.expenseName}>{item.name}</Text>
      <Text style={styles.expenseDetail}>Total cost: {item.amount} CZK</Text>
      <Text style={styles.expenseDetail}>Created at: {item.time}</Text>
    </Pressable>
  );


  const renderMembers = ({ item }: { item: groupMember }) => (
    <Text style={styles.expenseName}>{item.profiles.username}</Text>
  );


  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Group' }} />
      <Text style={styles.name}>{name}</Text>
      <View style={styles.buttonContainer}>
        <Pressable style={styles.button} onPress={handleGetEven}>
          <Text style={styles.buttonText}>Get Even</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={handleNotes}>
          <Text style={styles.buttonText}>Notes</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={handleOverview}>
          <Text style={styles.buttonText}>Overview</Text>
        </Pressable>
      </ View>

      <Text style={styles.sectionTitle}>Your balance</Text>
      <View style={styles.balanceContainer}>
        {groupMembers && groupMembers.length > 0 ? (
          <FlatList
            data={groupMembers}
            keyExtractor={(item) => item.id}
            renderItem={renderMembers}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <Text style={styles.balanceText}>No balance details yet</Text>
        )}
      </View>

      <Text style={styles.sectionTitle}>Expenses</Text>
      <FlatList
        data={expensesData}
        keyExtractor={(item) => item.id}
        renderItem={renderExpenses}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    // Removed alignItems to allow stretching
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: '#4CAF50', 
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
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
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  balanceContainer: {
    width: '100%',
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 20,
  },
  balanceText: {
    fontSize: 16,
    color: '#333',
  },
  expenseContainer: {
    width: '100%',
    padding: 15,
    backgroundColor: '#D4F0DD',
    borderRadius: 10,
    marginBottom: 15,
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
});