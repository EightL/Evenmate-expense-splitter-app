// /app/(user)/groupDetails/group/[id].tsx
// ITU Project, "Evenmate"
// Author(s): Jakub Lůčný
// VUT FIT 2024

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Image, Modal, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useGroupExpensesList } from '@/api/expenses';
import { useGroupMembersWithBalance, useGroupInfo } from '@/api/groups';
import defaultGroupPic from '@/assets/images/defaultGroupPic.png';
import { FontAwesome } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useGetCurrentUserId } from '@/api/getCurrentUserId';
import { useUserInfo } from '@/api/profiles';
import defaultProfilePic from '@/assets/images/defaultProfilePic.png';
import { MaterialIcons } from '@expo/vector-icons';


export default function GroupDetailScreen() {
  const THRESHOLD = 0.01; // Define threshold for treating values close to zero as zero (when showing balances)

  const router = useRouter();
  const { id: groupId, name } = useLocalSearchParams();
  const { data: groupData, error: groupError } = useGroupInfo(groupId);
  const [isImageLoading, setImageLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const groupName = groupData?.name;

  const { data: currentUserId } = useGetCurrentUserId();
  const { data: currentUserData } = useUserInfo(currentUserId);
  
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const myAvatar = currentUserData?.avatar_url;
  const handleGetEven = () => {
    router.push({
      pathname: '/groupDetails/group/getEvenGroup',
      params: {
        groupId,
        groupName,
        myAvatar,
      },
    });
  };

  const handleNotes = () => {
    router.push({
      pathname: '/groupDetails/group/groupNotes',
      params: {
        id: groupId,
        groupName,
      },
    });
  };

  const handleOverview = () => {
    router.push({
      pathname: '/groupDetails/group/groupOverview',
      params: {
        id: groupId,
        name: name,
        totalBalance: totalBalance,
      },
    });
  };

  const handleToDo = () => {
    router.push({
      pathname: '/groupDetails/group/groupTodo',
      params: {
        groupId,
      },
    });
  };

  const { data: expensesData, error, isLoading: isLoadingExpenses } = useGroupExpensesList(groupId);
  const { data: groupMembers, error: error2, isLoading: isLoadingBalances } = useGroupMembersWithBalance(groupId);

  const totalBalance = useMemo(() => {
    const balanceSum = groupMembers?.reduce((sum, item) => sum + item.balance, 0) || 0;
    return Math.abs(balanceSum) < THRESHOLD ? 0 : balanceSum; // Normalize small values
  }, [groupMembers]);
  

  const userIdToUsernameMap = useMemo(() => {
    const map = new Map();
    groupMembers?.forEach(member => {
      map.set(member.userid, member.profiles.username);
    });

    // Add current user to the map with "You" as the username
    if (currentUserId) {
      map.set(currentUserId, 'You');
    }

    return map;
  }, [groupMembers, currentUserId]);

  if (isLoadingExpenses) {
    return <ActivityIndicator />;
  }

  if (isLoadingBalances) {
    return <ActivityIndicator />;
  }

  if (error) {
    return <Text> Failed to load expenses </Text>;
  }

  if (error2) {
    return <Text> Failed to load group members </Text>;
  }

  type groupMember = {
    username: string;
    userid: string;
    profiles: {
      username: string;
    };
    balance: string;
  };

  type Expense = {
    id: string;
    name: string;
    amount: number;
    created_at: string;
    description: string;
    paid_by: string;
    involved_people : number;
    icon: string;

  };

  const sortedExpensesData = expensesData?.slice().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Render list of expenses
  const renderExpenses = ({ item }: { item: Expense }) => {
    const paidByUsername = userIdToUsernameMap.get(item.paid_by) || 'Unknown';
    const isUserInvolved = null;
    // Convert the created_at timestamp to a Date object
    const createdAtDate = new Date(item.created_at);
    const isPaidByCurrentUser = item.paid_by === currentUserId;
    // Extract the month and day
    const month = createdAtDate.toLocaleString('default', { month: 'short' });
    const day = createdAtDate.getDate();

    return (
      <TouchableOpacity
        style={styles.mainContainer2}
        onPress={() =>
          router.push({
            pathname: `/(shared)/expense/${encodeURIComponent(item.id)}`,
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
            <Text style={styles.boldText}>{paidByUsername}</Text> paid <Text style={styles.boldText}>{(item.amount).toFixed(2)} Kč</Text>
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

  // Renders all group members with their balances
  const renderMembers = ({ item }: { item: groupMember }) => {
    // Normalize the balance to convert small values close to zero to zero
    const normalizedBalance = Math.abs(item.balance) < THRESHOLD ? 0 : item.balance;
  
    return (
      <View style={{flexDirection: 'row'}}>
        <Image source={defaultProfilePic} style={{width:10, height: undefined, borderRadius: 5, flex: .5, aspectRatio: 1, marginRight: 5, marginTop: 2}} />
        <View style={{flexDirection: 'column', flex: 10}}>
          <Text>
            <Text style={styles.username}>{item.profiles.username}</Text>
            <Text>
              {Number(normalizedBalance) > 0 ? ' owes you ' : ' lent you '}
            </Text>
            <Text style={Number(normalizedBalance) >= 0 ? styles.positiveBalance : styles.negativeBalance}>
              {Number(normalizedBalance) > 0 ? `${Number(normalizedBalance).toFixed(2)} CZK` : `${(Number(normalizedBalance)).toFixed(2)} CZK`}
            </Text>
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainContainer}>
        {/* Left Container */}
        <View style={styles.leftContainer}>
          {/* Group Name Container */}
          <View style={styles.groupNameContainer}>
            <Text style={styles.groupName}>{name}</Text>
          </View>
          {/* Buttons Container */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.button} onPress={handleToDo}>
              <MaterialIcons name="add-task" size={24} color="black" />
              <Text style={styles.buttonText}>To-Do</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleGetEven}>
              <FontAwesome name="bars" size={24} color="black" />
              <Text style={styles.buttonText}>Get Even</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleNotes}>
              <FontAwesome name="sticky-note-o" size={24} color="black" />
              <Text style={styles.buttonText}>Notes</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Right Container (Image) */}
        <View style={styles.rightContainer}>
          <TouchableOpacity onPress={toggleModal}>
            <Image
              source={groupData.avatar_url && !isImageLoading ? { uri: groupData.avatar_url } : defaultGroupPic}
              style={styles.image}
              onLoadEnd={() => setImageLoading(false)} // Set loading to false once image loads
              onError={() => setImageLoading(false)}  // Handle potential errors by stopping loading
            />
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={isModalVisible} transparent={true} animationType="none">
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.modalCloseButton} onPress={toggleModal}>
            <Text style={styles.modalCloseButtonText}>Close</Text>
          </TouchableOpacity>
          <Image
            source={groupData.avatar_url ? { uri: groupData.avatar_url } : defaultGroupPic}
            style={styles.modalImage}
          />
        </View>
      </Modal>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
        <Text style={styles.sectionTitle}>Your balance: </Text>
        <Text style={totalBalance >= 0 ? styles.positiveBalanceTitle : styles.negativeBalanceTitle}>
          {totalBalance.toFixed(2)} CZK
        </Text>
      </View>
      <TouchableOpacity style={styles.balanceContainer} onPress={handleOverview}>
        {groupMembers && groupMembers.length > 0 ? (
          <FlatList
            data={groupMembers}
            keyExtractor={(item) => String(item.userid)}
            renderItem={renderMembers}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <Text style={styles.balanceText}>No balance details yet</Text>
        )}
      </TouchableOpacity>
      <Text style={styles.sectionTitle}>Expenses</Text>
      <FlatList
        data={sortedExpensesData}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderExpenses}
        showsVerticalScrollIndicator={false}
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
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  balanceContainer: {
    width: '100%',
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  balanceText: {
    fontSize: 16,
    color: '#333',
  },
  expenseDetail: {
    fontSize: 14,
    color: '#555',
  },
  positiveBalance: {
    color: 'green',
    fontSize: 16,
  },
  negativeBalance: {
    color: 'red',
    fontSize: 16,
  },
  positiveBalanceTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'green',
    marginVertical: 10,
  },
  negativeBalanceTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'red',
    marginVertical: 10,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  mainContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContainer: {
    flex: 3,
    justifyContent: 'space-between',
    marginRight: 8,
  },
  groupNameContainer: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  groupName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#D4F0DD',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  buttonText: {
    fontSize: 10,
  },
  rightContainer: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 110,
    borderRadius: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 16 / 9,
    borderRadius: 12,
  },
  modalCloseButton: {
    position: 'absolute',
    bottom: 250,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
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