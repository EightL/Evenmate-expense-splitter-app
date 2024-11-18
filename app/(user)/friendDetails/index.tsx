// app/(user)/friendDetails/index.tsx
import React, { useMemo, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, ActivityIndicator, Alert, RefreshControl, Image } from 'react-native';
import { Link, useRouter, useLocalSearchParams } from 'expo-router';
import { useMatesList } from '@/api/mates';
import { supabase } from '@/lib/supabase';
import { useGetCurrentUserId } from '@/api/getCurrentUserId';
import defaultProfilePic from '@/assets/images/defaultProfilePic.png';
import { useQueryClient } from '@tanstack/react-query';

export default function MatesScreen() {
  const THRESHOLD = 0.01; // Threshold to determine if the balance is zero
  const router = useRouter(); // Initialize the router
  // State to store the current user ID
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [isImageLoading, setImageLoading] = useState(true);
  // Retrieve the current user ID
  const { data: currentUserId, error: currentUserError } = useGetCurrentUserId();
  const { data: matesData, error, isLoading } = useMatesList(currentUserId);
  // Calculate total balance using useMemo
  const totalBalance = useMemo(() => {
    return matesData?.reduce((sum, item) => sum + (item.balance || 0), 0) || 0;
  }, [matesData]);

  const displayBalance = (Math.abs(totalBalance) < THRESHOLD ? 0 : totalBalance);

  const handleAddNewMate = () => {
    router.push('/friendDetails/addNewMate');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: Mate }) => {
    // Normalize the balance to convert small values close to zero to zero
    const normalizedBalance = Math.abs(item.balance) < THRESHOLD ? 0 : item.balance;

    return (
      <Pressable
        style={styles.shadowWrapper}
        onPress={() =>
          router.push({
            pathname: `/friendDetails/${encodeURIComponent(item.user2)}`,
            params: {
              mateId: item.user2,
              name: item.profiles.username,
              balance: normalizedBalance.toFixed(2), // Pass the normalized balance
              bankAccount: item.profiles.bank_account,
              email: item.profiles.email,
              avatar_url: item.profiles.avatar_url,
            },
          })
        }
      >
        <View style={styles.mateContainer}>
          <Image
            source={item.profiles.avatar_url && !isImageLoading ? { uri: item.profiles.avatar_url } : defaultProfilePic}
            style={styles.profileImage}
            onLoadEnd={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}
          />
          <Text style={styles.name}>{item.profiles.username}</Text>
          <View style={styles.balanceContainer}>
            <Text style={normalizedBalance >= 0 ? styles.positiveBalance : styles.negativeBalance}>
              {normalizedBalance >= 0 ? 'You lent:' : 'You owe:'}
            </Text>
            <Text style={normalizedBalance >= 0 ? styles.positiveBalance : styles.negativeBalance}>
              {normalizedBalance.toFixed(2)} CZK
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };
  console.log("Matesdata", matesData);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Balance: {Number(displayBalance) >= 0 ? (
          <>
            <Text style={styles.numberPositive}>{Number(displayBalance).toFixed(2)} CZK</Text>
          </>
        ) : (
          <>
            <Text style={styles.numberNegative}>{Number(displayBalance).toFixed(2)} CZK</Text>
          </>
        )}</Text>
      {matesData && matesData.length > 0 ? (
        <FlatList
          data={matesData}
          keyExtractor={(item) => item.profiles.username}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      ) : (
          <Text style={styles.lessTitle}>Looks like you have no mates! Click 'Add new mate' and start getting even!</Text>
      )}
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
  },
  lessTitle:{
    color: 'black',
    fontSize: 20,
    marginBottom: 10,
    marginTop: 10,
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
    padding: 10,
    borderRadius: 15,
    backgroundColor: '#D4F0DD',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 10,
    flex: 3, // Take 3/4 of the space
  },
  idkContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceContainer: {
    flex: 2, // Take 1/4 of the space
    alignItems: 'flex-end', // Align items to the right
  },
  positiveBalance: {
    color: 'green',
    fontSize: 13,
    textAlign: 'right', // Align text to the right
    fontWeight: 'bold',
  },
  negativeBalance: {
    color: 'red',
    fontSize: 13,
    textAlign: 'right', // Align text to the right
    fontWeight: 'bold'
  },
  listContainer: {
    paddingBottom: 100, // Add padding to avoid content being hidden behind buttons
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    resizeMode: 'cover',
    overflow: 'hidden',
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