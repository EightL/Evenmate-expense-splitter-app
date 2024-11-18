import React, { useState, useMemo } from 'react';
import { StyleSheet, ActivityIndicator, FlatList, View, Text, Pressable, Image, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useGroupsList, useGroupsTotalBalances } from '@/api/groups';
import { useGetCurrentUserId } from '@/api/getCurrentUserId';
import defaultGroupPic from '@/assets/images/defaultGroupPic.png';
import { useQueryClient } from '@tanstack/react-query';

export default function GroupsScreen() {
  const THRESHOLD = 0.01; // Define the threshold for treating values close to zero as zero

  const router = useRouter();
  const { data: currentUserId } = useGetCurrentUserId();
  const [isImageLoading, setImageLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

  // Use default values to avoid undefined or null issues
  const { data: groupsData = [], error, isLoading, refetch } = useGroupsList(currentUserId || null);
  const groupIds = groupsData.map(group => group.groupid);
  const { data: totalBalances = [], error: totalBalancesError, isLoading: totalBalancesLoading } = useGroupsTotalBalances(groupIds);

  // Create a mapping for group balances
  const groupBalanceMap = useMemo(() => {
    const map: { [key: string]: number } = {};
    groupsData.forEach((group, index) => {
      map[group.groupid] = totalBalances[index] || 0;
    });
    return map;
  }, [groupsData, totalBalances]);

  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries();
    setRefreshing(false);
  };

  if (isLoading || totalBalancesLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error || totalBalancesError) {
    return <Text>Failed to load groups</Text>;
  }

  type Group = {
    userid: string;
    groupid: string;
    groups: {
      id: string;
      name: string;
      notes: string;
      avatar_url: string;
    };
  };

  const renderItem = ({ item }: { item: Group }) => {
    // Normalize the total balance to convert small values close to zero to zero
    const totalBalance = groupBalanceMap[item.groupid] || 0;
    const normalizedTotalBalance = Math.abs(totalBalance) < THRESHOLD ? 0 : totalBalance;
  
    return (
      <Pressable
        style={styles.mainContainer}
        onPress={() =>
          router.push({
            pathname: `/(user)/groupDetails/group/${encodeURIComponent(item.groups.id)}`,
            params: { name: item.groups.name },
          })
        }
      >
        {/* Left Container */}
        <View style={styles.leftContainer}>
          {/* Top Section */}
          <View style={styles.topSection}>
            <Text style={styles.groupName} adjustsFontSizeToFit numberOfLines={1}>
              {item.groups.name}
            </Text>
          </View>
          {/* Middle Section */}
          <View>
            <Text style={normalizedTotalBalance >= 0 ? styles.amountTextPositive : styles.amountTextNegative}>{normalizedTotalBalance.toFixed(2)} Kč</Text>
          </View>
        </View>
  
        {/* Right Container */}
        <View style={styles.rightContainer}>
          <Image
            source={
              item.groups.avatar_url && !isImageLoading
                ? { uri: item.groups.avatar_url }
                : defaultGroupPic
            }
            style={styles.image}
            onLoadEnd={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}
          />
        </View>
      </Pressable>
    );
  };

  const handleCreateNewGroup = () => {
    router.push('/groupDetails/createGroup');
  };

  const handleJoinGroup = () => {
    router.push('/groupDetails/joinGroup');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your groups</Text>
      <FlatList
        data={groupsData}
        keyExtractor={(item) => item.groups.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
      <View style={styles.buttonContainer}>
        <Pressable style={styles.button} onPress={handleCreateNewGroup}>
          <Text style={styles.buttonText}>Create New Group</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={handleJoinGroup}>
          <Text style={styles.buttonText}>Join a Group</Text>
        </Pressable>
      </View>
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 10,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 100,
  },
  groupImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 15,
    resizeMode: 'cover',
    overflow: 'hidden',
    flex: 2,
  },
  itemContainer: {
    flexDirection: 'row',
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#D4F0DD',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  groupName: {
    fontSize: 30,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    width: '90%',
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
  mainContainer: {
    flexDirection: 'row-reverse',
    backgroundColor: '#fff',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  leftContainer: {
    flex: 2,
    justifyContent: 'space-between',
  },
  rightContainer: {
    flex: 2,
  },
  topSection: {
    marginBottom: 8,
    backgroundColor: '#D4F0DD',
    borderRadius: 8,
    padding: 8,
  },
  bottomSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountTextPositive: {
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: '#D4F0DD',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    color: '#4CAF50',
    textAlign: 'center',
  },
  amountTextNegative: {
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: '#D4F0DD',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    color: 'red',
    textAlign: 'center',
  },
  circleUser: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ADD8E6',
    marginRight: 4,
  },
  moreCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  image: {
    width: 170,
    height: undefined,
    aspectRatio: 16 / 9,
    borderRadius: 15,
  },
  positiveBalance: {
    color: 'green',
    fontSize: 16,
  },
  negativeBalance: {
    color: 'red',
    fontSize: 16,
  },
  noGroupsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 500
  },
  noGroupsText: {
    fontSize: 20,
    color: 'black',
  },
});