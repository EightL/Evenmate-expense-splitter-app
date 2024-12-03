// /app/(shared)/expense/[id].tsx
// ITU Project, "Evenmate"
// Author(s): Martin Ševčík
// VUT FIT 2024

import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { fetchExpenseDetails } from '@/api/involvedUsers';
import { useUserInfo } from '@/api/profiles';
import { useExpenseInfo } from '@/api/expenses';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ExpenseDetailScreenInMates() {
  const router = useRouter();
  const { id: expenseId, mateid } = useLocalSearchParams();
  const [splitDetails, setSplitDetails] = useState<{ username: string; share: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: expense} = useExpenseInfo(expenseId);
  const { data: User} = useUserInfo(expense?.paid_by);

  // Fetch the expense details
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const { splitDetails } = await fetchExpenseDetails(expenseId as string);

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

  // Check for errors
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
          {/* Icon */}
          <MaterialCommunityIcons name={expense.icon} size={40} color="black" />
        </View>
        {/* Expense details */}
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{expense.name}</Text>
          <Text style={styles.price}>{(expense.amount).toFixed(2)} CZK</Text>
          <Text style={styles.details}>
            Paid by: <Text style={{ fontWeight: 'bold' }}>{User.username}</Text> on <Text style={{fontWeight: 'bold'}}>{new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(expense.created_at))}</Text>
          </Text>
        </View>
      </View>
      {/* Split details */}
      <Text style={styles.sectionTitle}>Split Details</Text>
      <View>
        {splitDetails.map((item, index) => (
          <View key={index} style={styles.splitItem}>
            <Text style={styles.splitUsername}>{item.username}</Text>
            <Text style={styles.splitShare}>{item.share.toFixed(2)} CZK</Text>
          </View>
        ))}
      </View>
      {/* Edit expense button */}
      <Pressable
        style={styles.editButton}
        onPress={() =>
          router.push({
            pathname: `/expense/editExpense/${expenseId}`,
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
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    
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
    fontWeight: 'bold',
  },
  splitShare: {
    fontSize: 16,
    fontWeight: '500',
  },
  container2: {
    flexDirection: 'row',
    marginBottom: 20,
    marginTop: 20,
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
    aspectRatio : 1,
    backgroundColor: '#4CAF50', // Example background color for icon container
    padding: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1
  },
  infoContainer: {
    flex: 6,
  },
  price: {
    fontSize: 25,
    fontWeight: 'bold',
  },
  details: {
    fontSize: 12,
    color: '#777',
  },
});
