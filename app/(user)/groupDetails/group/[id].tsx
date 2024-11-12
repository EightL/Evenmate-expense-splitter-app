// app/(user)/groupDetails/[id].tsx
import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, FlatList, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Stack } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useSharedGroups } from '@/api/Rel_inGroup';
import { useGroupExpensesList } from '@/api/expenses';
import { useGroupMembersWithBalance, useGroupInfo } from '@/api/groups';


export default function GroupDetailScreen() {
  const router = useRouter();
  const {id: groupId, name} = useLocalSearchParams();
  const {data: groupData, error: groupError } = useGroupInfo(groupId);

  const groupName = groupData?.name;
  
  const handleGetEven = () => {
    router.push({
      pathname: '/groupDetails/group/getEvenGroup',
      params: {
        groupId,
        groupName,
      },
    });
  };

  const handleNotes = () => {
    router.push({
      pathname: '/groupDetails/group/groupNotes',
      params: {
        id: groupId,
        groupName,
      },
    });
  };

  const handleOverview = () => {
    router.push({
      pathname: '/groupDetails/group/groupOverview',
      params: {
        id: groupId,
        name: name,
        totalBalance: totalBalance,
      },
    });
  };

  const handleAddNewExpense = () => {
    router.push({
      pathname: '/expenseDetails',
    });
  };
  
  const { data: expensesData, error, isLoading: isLoadingExpenses} = useGroupExpensesList(groupId);
  const { data: groupMembers, error: error2, isLoading: isLoadingBalances} = useGroupMembersWithBalance(groupId);

  const totalBalance = useMemo(() => {
    return groupMembers?.reduce((sum, item) => sum + item.balance, 0) || 0;
  }, [groupMembers]);

  if (isLoadingExpenses) {
    return <ActivityIndicator />;
  }

  if (isLoadingBalances) {
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
    userid: string;
    profiles: {
      username: string;
    }
    balance: string;
  };
  

  type Expense = {
    id: string;
    name: string;
    amount: number;
    created_at: string;
    description: string;
    paid_by: string;
  };
  
  // console.log("time", expensesData[0]['created_at']); // this correctly outputs the timestamp

  const renderExpenses = ({ item }: { item: Expense }) => (
    <Pressable
      style={styles.expenseContainer}
      onPress={() =>
        router.push({
          pathname: `/groupDetails/group/expense/${encodeURIComponent(item.id)}`,
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
      <Text style={styles.expenseDetail}>Created at: {new Date(item.created_at).toLocaleString()}</Text>
    </Pressable>
  );


  const renderMembers = ({ item }: { item: groupMember }) => (
    <View>
      <Text>
        <Text style={styles.username}>{item.profiles.username}</Text>
        <Text>
          {item.balance > 0 ? ' owes you ' : ' lent you '}
        </Text>
        <Text style={item.balance >= 0 ? styles.positiveBalance : styles.negativeBalance}>
          {item.balance > 0 ? `${item.balance.toFixed(2)} CZK` : `${(-item.balance).toFixed(2)} CZK`}
        </Text>
      </Text>
    </View>
  );


  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Group' }} />
      <Text style={styles.name}>{groupName}</Text>
      <View style={styles.buttonContainer}>
        <Pressable style={styles.button} onPress={() => handleGetEven()}>
          <Text style={styles.buttonText}>Get Even</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => handleNotes()}>
          <Text style={styles.buttonText}>Notes</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => handleAddNewExpense()}>
          <Text style={styles.buttonText}>+ Expense</Text>
        </Pressable>
      </ View>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
        <Text style={styles.sectionTitle}>Your balance: </Text>
        <Text style={totalBalance >= 0 ? styles.positiveBalanceTitle : styles.negativeBalanceTitle}>
          {totalBalance.toFixed(2)} CZK
        </Text>
      </View>
      <Pressable style={styles.balanceContainer} onPress={() => handleOverview()}>
        {groupMembers && groupMembers.length > 0 ? (
          <FlatList
            data={groupMembers}
            keyExtractor={(item) => String(item.userid)}
            renderItem={renderMembers}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <Text style={styles.balanceText}>No balance details yet</Text>
        )}
      </Pressable>

      <Text style={styles.sectionTitle}>Expenses</Text>
      <FlatList
        data={expensesData}
        keyExtractor={(item) => String(item.id)}
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
  positiveBalance: {
    color: 'green',
    fontSize: 16,
  },
  negativeBalance: {
    color: 'red',
    fontSize: 16,
  },
  positiveBalanceTitle:{
    fontSize: 22,
    fontWeight: 'bold',
    color: 'green',
    marginVertical: 10,

  },
  negativeBalanceTitle:{
    fontSize: 22,
    fontWeight: 'bold',
    color: 'red',
    marginVertical: 10,

  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
});