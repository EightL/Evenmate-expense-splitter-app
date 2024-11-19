import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { fetchExpenseDetails } from '@/api/involvedUsers';
import { useUserInfo } from '@/api/profiles';
import { useExpenseInfo } from '@/api/expenses';
import { FontAwesome5 } from '@expo/vector-icons';

type Expense = {
  id: string;
  name: string;
  amount: number;
  paid_by: string;
  created_at: string;
  in_group: string;
  involved_people: number;
};

type User = {
  id: string;
  username: string;
  bank_account: string;
  email: string;
};

export default function ExpenseDetailScreenInMates() {
  const router = useRouter();
  const { id: expenseId, mateid } = useLocalSearchParams();
  // const [expense, setExpense] = useState<Expense | null>(null);
  const [splitDetails, setSplitDetails] = useState<{ username: string; share: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: expense, error: error10 } = useExpenseInfo(expenseId);
  const { data: User, error : error2 } = useUserInfo(expense?.paid_by);
  // const { expenseData, splitDetails } = await fetchExpenseDetails(expenseId as string);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // setIsLoading(true);
        const { expenseData, splitDetails } = await fetchExpenseDetails(expenseId as string);

        // setExpense(expenseData);
        setSplitDetails(splitDetails);
      } catch (error: any) {
        console.error('Error fetching expense details:', error.message);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [expenseId]);

  if (isLoading) {
    return <ActivityIndicator/>;
  }

  if (error) {
    return <Text style={styles.errorText}>{`Error: ${error}`}</Text>;
  }

  if (!expense) {
    return <Text style={styles.errorText}>Expense not found.</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.container2}>
        <View style={styles.iconContainer}>
          {/* You can use any icon library or image */}
          <FontAwesome5 name="tree" size={24} color="black" />
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{expense.name}</Text>
          <Text style={styles.price}>{(expense.amount).toFixed(2)} CZK</Text>
          <Text style={styles.details}>{expense.paid_by}</Text>
        </View>
      </View>
      <Pressable
        style={styles.editButton}
        onPress={() =>
          router.push({
            pathname: `/friendDetails/expense/editExpense/${expenseId}`,
            params: { mateId: mateid },
          })
        }
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
  container2: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#EAF5EA', // Example background color
    borderRadius: 8,
    alignItems: 'center',
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
  iconContainer: {
    marginRight: 10,
    backgroundColor: '#A2D9A2', // Example background color for icon container
    padding: 10,
    borderRadius: 5,
  },
  infoContainer: {
    flex: 1,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  details: {
    fontSize: 12,
    color: '#777',
  },
});
