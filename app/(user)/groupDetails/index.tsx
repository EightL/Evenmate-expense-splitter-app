import React, { useState, useMemo } from 'react';
import { StyleSheet, ActivityIndicator, FlatList, View, Text, Pressable, Image, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import defaultGroupPic from '@/assets/images/defaultGroupPic.png';
import { useQueryClient, InvalidateQueryFilters } from '@tanstack/react-query';
import { Platform } from 'react-native';
import { useGroupsList, useGroupsTotalBalances } from '@/api/groups';
import { useGetCurrentUserId } from '@/api/getCurrentUserId';


export default function GroupsScreen() {
  const THRESHOLD = 0.01; // Define the threshold for treating values close to zero as zero

  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: currentUserId } = useGetCurrentUserId();

  const [isImageLoading, setImageLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Use default values to avoid undefined or null issues
  const { data: groupsData = [], error: groupsDataError, isLoading, refetch } = useGroupsList(currentUserId || null);
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

  if (groupsDataError || totalBalancesError) {
    return <Text>Failed to load groups</Text>;
  }

  // Create new group
  const handleCreateNewGroup = () => {
    router.push('/groupDetails/createGroup');
  };

  // Join new group
  const handleJoinGroup = () => {
    router.push('/groupDetails/joinGroup');
  };

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

  // Render users list of groups
  const renderGroups = ({ item }: { item: Group }) => {
    // Normalize the total balance to convert small values close to zero to zero
    const totalBalance = groupBalanceMap[item.groupid] || 0;
    const normalizedTotalBalance = Math.abs(totalBalance) < THRESHOLD ? 0 : totalBalance;
  
    return (
      <TouchableOpacity
        style={styles.mainContainer}
        onPress={() =>
          router.push({
            pathname: `/(user)/groupDetails/group/${encodeURIComponent(item.groups.id)}`,
            params: { name: item.groups.name },
          })
        }>

        {/* Right container */}
        <View style={Platform.OS === 'android' ? styles.leftContainerAndroid : styles.leftContainer}>
          {/* Top Section - group name */}
          <View style={styles.topSection}>
            <Text style={styles.groupName} adjustsFontSizeToFit numberOfLines={1}>
              {item.groups.name}
            </Text>
          </View>
          {/* Middle Section - group balance */}
          <View>
            <Text style={normalizedTotalBalance >= 0 ? styles.amountTextPositive : styles.amountTextNegative}>{normalizedTotalBalance.toFixed(2)} Kč</Text>
          </View>
        </View>
  
        {/* Left Container */}
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
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your groups</Text>
      {groupsData && groupsData.length > 0 ? (
      <FlatList
        data={groupsData}
        keyExtractor={(item) => item.groups.id}
        renderItem={renderGroups}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
      ) : (
      <Text style={styles.noGroupsText}>
        Looks like you aren't in any group yet! Create new group and share QR code from group settings or join a group with QR code.
      </Text>
      )}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleCreateNewGroup}>
          <Text style={styles.buttonText}>Create New Group</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleJoinGroup}>
          <Text style={styles.buttonText}>Join a Group</Text>
        </TouchableOpacity>
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
  groupName: {
    fontSize: 30,
    fontWeight: '600',
    color: '#FFF',
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
    marginBottom: 15,
  },
  leftContainer: {
    flex: 1,
  },
  leftContainerAndroid: {
    flex: 0.82,
  },
  rightContainer: {
    flex: 1,
  },
  topSection: {
    marginBottom: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    flex : 3,
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
  image: {
    width: 170,
    height: undefined,
    aspectRatio: 16 / 9,
    borderRadius: 15,
  },
  noGroupsText: {
    fontSize: 19,
    color: 'black',
  },
});