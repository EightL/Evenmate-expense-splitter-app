// app/(user)/expenseDetails/[id].tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';

type Expense = {
  id: string;
  name: string;
  amount: number;
  paid_by: string;
  created_at: string;
};

type RelOwesFor = {
  userid: string;
  expenseid: string;
};

export default function ExpenseDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [splitDetails, setSplitDetails] = useState<{ username: string; share: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExpenseDetails = async () => {
      try {
        // Fetch expense details
        const { data: expenseData, error: expenseError } = await supabase
          .from('Expenses')
          .select('*')
          .eq('id', id)
          .single();
  
        if (expenseError) throw expenseError;
        setExpense(expenseData);
  
        // Fetch related users from Rel_owesFor
        const { data: relData, error: relError } = await supabase
          .from('Rel_owesFor')
          .select('userid')
          .eq('expenseid', id);
  
        if (relError) throw relError;
  
        // Fetch usernames of involved users
        const userIds = relData.map(rel => rel.userid);
        
        // Add the payer's ID to the list if they are not already included
        if (!userIds.includes(expenseData.paid_by)) {
          userIds.push(expenseData.paid_by);
        }
  
        const { data: users, error: usersError } = await supabase
          .from('profiles') // Assuming you have a 'profiles' table
          .select('username')
          .in('id', userIds);
  
        if (usersError) throw usersError;
  
        // Calculate share per user
        const share = expenseData.amount / users.length;
        const split = users.map(user => ({
          username: user.username,
          share,
        }));
  
        setSplitDetails(split);
      } catch (error: any) {
        console.error('Error fetching expense details:', error.message);
        Alert.alert('Error', error.message);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchExpenseDetails();
  }, [id]);
  

  if (isLoading) {
    return <ActivityIndicator style={styles.loader} />;
  }

  if (!expense) {
    return <Text style={styles.errorText}>Expense not found.</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{expense.name}</Text>
      <Text style={styles.detail}>Cost: {expense.amount} CZK</Text>
      <Text style={styles.detail}>Paid by: {expense.paid_by}</Text>
      <Text style={styles.sectionTitle}>Split Between:</Text>
      <FlatList
        data={splitDetails}
        keyExtractor={(item) => item.username}
        renderItem={({ item }) => (
          <View style={styles.splitItem}>
            <Text style={styles.splitUsername}>{item.username}</Text>
            <Text style={styles.splitShare}>{item.share.toFixed(2)} CZK</Text>
          </View>
        )}
      />
      <Pressable
        style={styles.editButton}
        onPress={() => router.push(`/groupDetails/expense/editExpense/${id}`)}
      >
        <Text style={styles.editButtonText}>Edit Expense</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detail: {
    fontSize: 18,
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginVertical: 15,
  },
  splitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  splitUsername: {
    fontSize: 16,
  },
  splitShare: {
    fontSize: 16,
    fontWeight: '500',
  },
  editButton: {
    marginTop: 30,
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  backButton: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
  },
  backButtonText: {
    fontSize: 16,
    color: '#333',
  },
});