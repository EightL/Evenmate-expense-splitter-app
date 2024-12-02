// /app/(user)/friendDetails/index.tsx
// ITU Project, "Evenmate"
// Author(s): Martin Ševčík
// VUT FIT 2024

import { useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useMatesList } from '@/api/mates';
import { useGetCurrentUserId } from '@/api/getCurrentUserId';
import defaultProfilePic from '@/assets/images/defaultProfilePic.png';
import { useQueryClient } from '@tanstack/react-query';

export default function MatesScreen() {
  const THRESHOLD = 0.01; // Threshold to determine if the balance is zero
  const router = useRouter();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [isImageLoading, setImageLoading] = useState(true);
  const { data: currentUserId, error: currentUserError } = useGetCurrentUserId();
  const { data: matesData, error, isLoading } = useMatesList(currentUserId);
  const totalBalance = useMemo(() => {
    return matesData?.reduce((sum, item) => sum + (item.balance || 0), 0) || 0;
  }, [matesData]);

  // Normalize the balance to convert small values close to zero to zero
  const displayBalance = (Math.abs(totalBalance) < THRESHOLD ? 0 : totalBalance);

  // Function to handle adding a new mate
  const handleAddNewMate = () => {
    router.push('/friendDetails/addNewMate');
  };

  // Function to refresh the data
  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries();
    setRefreshing(false);
  };

  // Render the list of mates
  const renderItem = ({ item }: { item: Mate }) => {
    const normalizedBalance = Math.abs(item.balance) < THRESHOLD ? 0 : item.balance;

    return (
      <TouchableOpacity
        style={styles.shadowWrapper}
        onPress={() =>
          router.push({
            pathname: `/friendDetails/${encodeURIComponent(item.user2)}`,
            params: {
              mateId: item.user2,
              name: item.profiles.username,
              balance: normalizedBalance.toFixed(2),
              bankAccount: item.profiles.bank_account,
              email: item.profiles.email,
              avatar_url: item.profiles.avatar_url,
            },
          })
        }
      >
        {/* Display the mate information */}
        <View style={styles.mateContainer}>
          <Image
            source={item.profiles.avatar_url && !isImageLoading ? { uri: item.profiles.avatar_url } : defaultProfilePic}
            style={styles.profileImage}
            onLoadEnd={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}
          />
          {/* Display the mate's name and balance */}
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
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={styles.container}>
      {/* Display the total balance */}
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
        // Display the list of mates
        <FlatList
          data={matesData}
          keyExtractor={(item) => item.profiles.username}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      ) : (
          // Display a message if there are no mates
          <Text style={styles.lessTitle}>Looks like you have no mates! Click 'Add new mate' and start getting even!</Text>
      )}
      {/* Add new mate button */}
      <TouchableOpacity style={styles.button} onPress={handleAddNewMate}>
        <Text style={styles.buttonText}>Add new mate</Text>
      </TouchableOpacity>
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
    textAlign: 'center',
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 5,
    width: '100%', 
  },
  mateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: 10,
    borderRadius: 15,
    backgroundColor: '#D4F0DD',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 10,
    flex: 3,
  },
  balanceContainer: {
    flex: 2,
    alignItems: 'flex-end',
  },
  positiveBalance: {
    color: 'green',
    fontSize: 13,
    textAlign: 'right', 
    fontWeight: 'bold',
  },
  negativeBalance: {
    color: 'red',
    fontSize: 13,
    textAlign: 'right',
    fontWeight: 'bold'
  },
  listContainer: {
    paddingBottom: 100,
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