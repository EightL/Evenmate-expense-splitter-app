// app/(user)/groupDetails/group/groupOverview.tsx

import React, { useMemo, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useGroupMembersWithBalance } from '@/api/groups';
import { supabase } from '@/lib/supabase'; // Ensure supabase is correctly imported

type GroupMember = {
  userid: string;
  profiles: {
    username: string;
  };
  balance: number;
};

export default function GroupOverviewScreen() {
  const router = useRouter();
  const { id: groupId, name: groupName, totalBalance } = useLocalSearchParams<{ id: string; name: string; totalBalance: number }>();

  const [session, setSession] = useState<{ user: { id: string } } | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState<boolean>(true);

  // Retrieve current user session
  useEffect(() => {
    const fetchSession = async () => {
      setIsSessionLoading(true);
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error fetching session:', error.message);
          Alert.alert('Authentication Error', 'Failed to retrieve user session.');
          // Optionally, navigate to the sign-in screen
          router.replace('/(auth)/sign-in');
          setIsSessionLoading(false);
          return;
        }

        if (data.session) {
          setSession(data.session);
        } else {
          Alert.alert('Not Authenticated', 'Please log in to view group details.');
          router.replace('/(auth)/sign-in');
        }
      } catch (err: any) {
        console.error('Unexpected error fetching session:', err);
        Alert.alert('Error', 'An unexpected error occurred.');
      } finally {
        setIsSessionLoading(false);
      }
    };

    fetchSession();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (!newSession) {
        Alert.alert('Session Ended', 'You have been logged out.');
        router.replace('/(auth)/sign-in');
      }
    });

    // Cleanup listener on unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  // Fetch group members with balance once session is available
  const { data: groupMembers, error, isLoading } = useGroupMembersWithBalance(groupId);

  // Sort members, placing the current user first
  const sortedMembers = useMemo(() => {
    if (!groupMembers) return [];
    return [...groupMembers].sort((a, b) => {
      if (a.userid === session?.user.id) return -1;
      if (b.userid === session?.user.id) return 1;
      return 0;
    });
  }, [groupMembers, session?.user.id]);

  if (isSessionLoading || isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
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

  // Extract current user and other members
  const currentUser = sortedMembers.find(member => member.userid === session?.user.id);
  const otherMembers = sortedMembers.filter(member => member.userid !== session?.user.id);

  const renderMember = ({ item }: { item: GroupMember }) => (
    <View style={styles.memberContainer}>
      <Text style={styles.username}>{item.profiles.username}</Text>
      <Text style={[styles.balanceText, item.balance < 0 ? styles.negativeBalance : styles.positiveBalance]}>
        {item.balance >= 0
          ? `You lent: ${Number(item.balance).toFixed(2)} CZK`
          : `You owe: ${Number(item.balance).toFixed(2)} CZK`}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Group Members Overview</Text>

      {/* Current User Container */}
      {session?.user.id && (
        <View style={styles.currentUserContainer}>
          <Text style={styles.currentUserTitle}>Your Balance</Text>
          <Text style={[styles.totalBalance, totalBalance < 0 ? styles.negativeBalance : styles.positiveBalance]}>
            {totalBalance >= 0 ? `${Number(totalBalance).toFixed(2)} CZK` : `${Number(totalBalance).toFixed(2)} CZK`}
          </Text>
        </View>
      )}

      {/* Other Members List */}
      <Text style={styles.subTitle}>Members</Text>
      <FlatList
        data={otherMembers}
        keyExtractor={(item) => item.userid}
        renderItem={renderMember}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.noMembersText}>No other members in the group.</Text>
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