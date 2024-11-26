import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Image, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useGroupMembers } from '@/api/groups';
import defaultProfilePic from '@/assets/images/defaultProfilePic.png';
import { useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import evenmatelogo from '@/assets/images/Evenmatelogo_1.png';
export default function GetEvenGroupScreen() {
  const {groupId, groupName, myAvatar } = useLocalSearchParams();
  const router = useRouter();
  const { data: groupMembers, error } = useGroupMembers(groupId);
  const [isImageLoading, setImageLoading] = React.useState(true);

  if (error) {
    return <Text style={styles.errorText}>Failed to load group members</Text>;
  }

  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Image source={evenmatelogo} style={styles.evenmatelogo}></Image>
      ),
      headerLeft: () => (
        <TouchableOpacity
            onPress={() => router.back()}
            accessibilityLabel="Go Back"
            accessibilityRole="button"
        >
            <Ionicons
            name='arrow-back'
            size={30}
            color="#4CAF50" 
            />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  type GroupMember = {
    id: string;
    profiles: {
      userid : string;
      username: string;
      avatar_url: string;
    };
  };

  const handleGetEven = (mateId, memberName) => {
    router.push({
      pathname: '/groupDetails/group/getEvenMate',
      params: {
        name: memberName,
        mateId: mateId,
        groupId: groupId,
        myAvatar: myAvatar,
      },
    });
  };

  const renderMemberItem = ({ item }: { item: GroupMember }) => (
    <TouchableOpacity
      style={styles.memberContainer}
      onPress={() => handleGetEven(item.profiles.id, item.profiles.username)}
    >
      <Image
        source={
          item.profiles.avatar_url && !isImageLoading
            ? { uri: item.profiles.avatar_url }
            : defaultProfilePic
        }
        style={styles.profileImage}
        onLoadEnd={() => setImageLoading(false)}
        onError={() => setImageLoading(false)}
      />
      <Text style={styles.memberName}>{item.profiles.username}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.groupName}>Get Even for Group</Text>
      <Text style={styles.title}>{groupName}</Text>

      <FlatList
        data={groupMembers}
        keyExtractor={(item) => item.userid}
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
    backgroundColor: '#fff',
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
    flexDirection: 'row', // Align items in a row
    justifyContent: 'space-between', // Space between items
    alignItems: 'center', // Center items vertically
    width: '100%', // Full width of the parent container
    padding: 10,
    borderRadius: 15,
    backgroundColor: '#D4F0DD',
    marginBottom: 10,
  },
  memberName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 10,
    flex: 3, // Take 3/4 of the space
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
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    resizeMode: 'cover',
    overflow: 'hidden',
    marginRight: 10,
  },
  evenmatelogo: {
    width: 33,
    height: 27,
    marginRight: 0,
    resizeMode: 'cover',
    overflow: 'hidden',
  },
});
