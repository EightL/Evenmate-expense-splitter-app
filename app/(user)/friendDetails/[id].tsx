// /app/(user)/friendDetails/[id].tsx
// ITU Project, "Evenmate"
// Author(s): Martin Ševčík
// VUT FIT 2024

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, FlatList, Image, TouchableOpacity } from 'react-native';
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
import defaultProfilePic from '@/assets/images/defaultProfilePic.png';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function FriendDetailScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id: mateId, name, balance, bankAccount, email } = useLocalSearchParams();
  const { data: mateData } = useUserInfo(mateId);
  const navigation = useNavigation();
  const [isImageLoading, setImageLoading] = useState(true);
  const { data: currentUserId } = useGetCurrentUserId();
  const { data: currentuserdata } = useUserInfo(currentUserId);
  const { data: sharedGroups, isLoading, error } = useSharedGroups(currentUserId, mateId);
  const { data: expensesList } = useMateExpenses(currentUserId, mateId);

  // Header
  useLayoutEffect(() => {
    navigation.setOptions({
      // remove friend button
      headerRight: () => (
        <TouchableOpacity
          onPress={() => { handleRemoveFriend() }}
          style={{ marginRight: 15 }}
        >
          <Ionicons name="trash" size={24} color="#000" />
        </TouchableOpacity>
      ),
      // go back button
      headerLeft: () => (
        <TouchableOpacity
            onPress={() => router.back()}
            accessibilityLabel="Go Back"
            accessibilityRole="button"
        >
            <Ionicons
            name='arrow-back'
            size={30}
            color="#4CAF50" // Blue color
            />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);
  
  const avatar_url = mateData?.avatar_url;
  const myAvatar = currentuserdata?.avatar_url;

  // Handle get even
  const handleGetEven = () => {
    router.push({
      pathname: `/friendDetails/getEvenMate`,
      params: {
        name: name,
        mateId: mateId,
        balance: balance,
        avatar_url: avatar_url,
        currentUserId: currentUserId,
        myAvatar: myAvatar,
      },
    });
  };

  // Handle remove friend
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

  // Sort expenses by newest
  const sortedExpensesData = expensesList?.slice().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Rendering each expense
  const renderExpenses = ({ item }: { item: Expense }) => {
    // Convert the created_at timestamp to a Date object
    const createdAtDate = new Date(item.created_at);
    const isPaidByCurrentUser = item.paid_by === currentUserId;
    // Extract the month and day
    const month = createdAtDate.toLocaleString('default', { month: 'short' });
    const day = createdAtDate.getDate();
    const paidByUser = currentUserId === item.paid_by ? "You" : name;

    return (
      <TouchableOpacity
        style={styles.mainContainer2}
        onPress={() =>
          router.push({
            pathname: `/expense/${encodeURIComponent(item.id)}`,
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
        {/* Date Container */}
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{month}</Text>
          <Text style={styles.dateText}>{day}</Text>
        </View>

        {/* Icon Container */}
        <View style={styles.iconContainer}>
          <View style={styles.iconWrapper}>
            <MaterialCommunityIcons name={item.icon} size={24} color="black" />
          </View>
        </View>

        {/* Name + Info Container */}
        <View style={styles.infoContainer}>
          <Text style={styles.expenseName}>{item.name}</Text>
          <Text style={styles.expenseDetails}>
            <Text style={styles.boldText}>{paidByUser}</Text> paid <Text style={styles.boldText}>{(item.amount).toFixed(2)} Kč</Text>
          </Text>
        </View>

        {/* Borrowed Amount Container */}
        <View style={styles.borrowContainer}>
          <Text style={styles.borrowText}>{isPaidByCurrentUser ? 'you lent' : 'you borrowed'}</Text>
          <Text style={isPaidByCurrentUser ? styles.lentAmount : styles.borrowAmount}>{isPaidByCurrentUser ? (item.amount - (item.amount / item.involved_people)).toFixed(2) : (item.amount / item.involved_people).toFixed(2)} CZK</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied to Clipboard');
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        {/* Name and Balance */}
        <View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.balance}>
            {Number(balance) >= 0 ? ( <>You lent: <Text style={styles.numberPositive}>{Number(balance).toFixed(2)} CZK</Text> </> ) : ( <>You owe: <Text style={styles.numberNegative}>{Number(balance).toFixed(2)} CZK</Text> </> )}
          </Text>
        {/* Profile Image */}
        </View>
          {mateData && mateData.avatar_url ? (
            <Image
            source={{ uri: mateData.avatar_url }}
            style={styles.profileImage}
            onLoadEnd={() => setImageLoading(false)}
            />
            ) : (
            <Image
            source={defaultProfilePic}
            style={styles.profileImage}
            />
          )}
      </View>
      {/* Bank account */}
      <View style={styles.infoRow}>
        <Text style={styles.label}>Bank account:</Text>
        <TouchableOpacity style={styles.infoBox} onPress={() => copyToClipboard(bankAccount)}>
          <Text style={styles.infoText}>{bankAccount}</Text>
        </TouchableOpacity>
      </View>
      {/* Email */}
      <View style={styles.infoRow}>
        <Text style={styles.label}>Email:</Text>
        <TouchableOpacity style={styles.infoBox} onPress={() => copyToClipboard(email)}>
          <Text style={styles.infoText}>{email}</Text>
        </TouchableOpacity>
      </View>
      
      {/* Shared Groups */}
      <View style={styles.detailContainer}>
        <Text style={styles.label}>Shared Groups:</Text>
      </View>
      {isLoading ? ( <ActivityIndicator size="small" color="#4CAF50" /> ) : error ? ( <Text>Error loading shared groups: {error.message}</Text> ) : sharedGroups && sharedGroups.length > 0 ? (
        <View style={styles.groupsContainer}>
          {sharedGroups.map((group) => (
            <TouchableOpacity style={styles.groupBubble} key={group.id} onPress={() =>
                router.push({
                  pathname: `/(user)/groupDetails/group/${encodeURIComponent(group.id)}`,
                  params: { name: group.name },
                })}>
              <Text style={styles.groupName}>{group.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <Text style={styles.numberNegative}>No shared groups</Text>
      )}

      {/* Get Even Button */}
      <TouchableOpacity style={styles.button} onPress={handleGetEven}>
        <Text style={styles.buttonText}>Get Even</Text>
      </TouchableOpacity>

      {/* Expense History */}
      <Text style={styles.header}>Expense History</Text>
      <FlatList
        style={{ width: '100%' }}
        data={sortedExpensesData}
        keyExtractor={(item) => item.id}
        renderItem={renderExpenses}
        contentContainerStyle={styles.matesList}
      />
    </View>
  );
} 


const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  groupsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  infoBox: {
    backgroundColor: '#D4F0DD',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    marginTop: 30,
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: '#fff', // White text
    fontSize: 18,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  groupName: {
    fontSize: 18,
    marginBottom: 5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    resizeMode: 'cover',
    overflow: 'hidden',
    
  },
  expenseName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
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
    fontSize: 20,
  },
  numberNegative: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 20,
  },
  mainContainer2: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#D4F0DD',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateContainer: {
    flex: 1,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 13,
    marginRight: 4,
    fontWeight: 'bold',
  },
  iconWrapper: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 8,
  },
  infoContainer: {
    flex: 5,
    paddingHorizontal: 8,
  },
  expenseName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  expenseDetails: {
    fontSize: 11,
    color: '#333',
  },
  boldText: {
    fontWeight: 'bold',
  },
  borrowContainer: {
    flex: 3,
    alignItems: 'flex-end',
  },
  borrowText: {
    fontSize: 12,
  },
  borrowAmount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'red',
  },
  lentAmount:{
    fontSize: 12,
    fontWeight: 'bold',
    color: 'green',
  },
  iconContainer: {
    flex: 1.3,
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: '#fff',
    alignItems: 'center',
  },

});