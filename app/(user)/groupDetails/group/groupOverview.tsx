import { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import evenmatelogo from '@/assets/images/Evenmatelogo_1.png';
import { useGroupMembersWithBalance } from '@/api/groups';

type GroupMember = {
  userid: string;
  profiles: {
    username: string;
  };
  balance: number;
};

export default function GroupOverviewScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { id: groupId, name: groupName, totalBalance } = useLocalSearchParams();

  // Header buttons
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <Image source={evenmatelogo} style={styles.evenmatelogo}></Image>,
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityLabel="Go Back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={30} color="#4CAF50" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // Fetch group members with balance
  const { data: groupMembers, error, isLoading } = useGroupMembersWithBalance(groupId);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Failed to load group members.</Text>
      </View>
    );
  }

  // Renders group members with balances
  const renderMember = ({ item }: { item: GroupMember }) => (
    <View style={styles.memberContainer}>
      <Text style={styles.username}>{item.profiles.username}</Text>
      <Text
        style={[
          styles.balanceText,
          item.balance < 0 ? styles.negativeBalance : styles.positiveBalance,
        ]}
      >
        {item.balance >= 0
          ? `You lent: ${Number(item.balance).toFixed(2)} CZK`
          : `You owe: ${Number(item.balance).toFixed(2)} CZK`}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Group Members Overview</Text>

      {/* Total Balance Container */}
      <View style={styles.currentUserContainer}>
        <Text style={styles.currentUserTitle}>Group Balance</Text>
        <Text
          style={[
            styles.totalBalance,
            totalBalance < 0 ? styles.negativeBalance : styles.positiveBalance,
          ]}
        >
          {totalBalance >= 0 ? `${Number(totalBalance).toFixed(2)} CZK` : `${Number(totalBalance).toFixed(2)} CZK`}
        </Text>
      </View>

      {/* Members List */}
      <Text style={styles.subTitle}>Members</Text>
      <FlatList
        data={groupMembers}
        keyExtractor={(item) => item.userid}
        renderItem={renderMember}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.noMembersText}>No members in the group.</Text>
        }
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 25,
    textAlign: 'center',
    color: '#333',
  },
  currentUserContainer: {
    padding: 20,
    marginBottom: 25,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentUserTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 5,
    color: '#2E7D32',
  },
  totalBalance: {
    fontSize: 22,
    fontWeight: '700',
  },
  evenmatelogo: {
    width: 33,
    height: 27,
    marginRight: 0,
    resizeMode: 'cover',
    overflow: 'hidden',
  },
  subTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 15,
    color: '#555',
  },
  listContainer: {
    paddingBottom: 20,
  },
  memberContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#D4F0DD',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  balanceText: {
    fontSize: 16,
    fontWeight: '500',
  },
  positiveBalance: {
    color: '#388E3C',
  },
  negativeBalance: {
    color: '#D32F2F',
  },
  noMembersText: {
    textAlign: 'center',
    color: '#777',
    fontSize: 16,
    marginTop: 20,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 16,
    textAlign: 'center',
  },
});
