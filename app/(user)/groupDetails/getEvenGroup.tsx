import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useGroupMembers } from '@/api/groups';

export default function GetEvenGroupScreen() {
  const {mateId, groupId, name } = useLocalSearchParams();
  const router = useRouter();
  const { data: groupMembers, error } = useGroupMembers(groupId);

  if (error) {
    return <Text style={styles.errorText}>Failed to load group members</Text>;
  }

  type GroupMember = {
    id: string;
    profiles: {
      id : string;
      username: string;
    };
  };

  const handleGetEven = (mateId, memberName) => {
    console.log("MateId: ", mateId);
    console.log("MateName: ", memberName);
    router.push({
      pathname: '/groupDetails/getEvenMate',
      params: {
        name: memberName,
        mateId: mateId,
      },
    });
  };

  const renderMemberItem = ({ item }: { item: GroupMember }) => (
    <Pressable
      style={styles.memberContainer}
      onPress={() => handleGetEven(item.profiles.id, item.profiles.username)}
    >
      <Text style={styles.memberName}>{item.profiles.username}</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Get Even for Group</Text>
      <Text style={styles.groupName}>{name}</Text>
      <Text style={styles.groupId}>Group ID: {groupId}</Text>

      <FlatList
        data={groupMembers}
        keyExtractor={(item) => item.id}
        renderItem={renderMemberItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>No members found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f4f8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  groupName: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    color: '#4CAF50',
    marginBottom: 5,
  },
  groupId: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 15,
  },
  listContainer: {
    paddingBottom: 20,
  },
  memberContainer: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  memberName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});
