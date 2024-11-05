// app/(user)/groupDetails/index.tsx
import React from 'react';
import { useState, useEffect } from 'react';
import { StyleSheet, ActivityIndicator, FlatList, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useGroupsList } from '@/api/groups';

export default function GroupsScreen() {
  const router = useRouter();

  // State to store the current user ID
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Retrieve the current user ID once on component mount
  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error fetching session:', error.message);
        return;
      }
      setCurrentUserId(session?.user.id || null);
    };

    fetchSession();
  }, []);
  
  const { data: groupsData, error, isLoading } = useGroupsList(currentUserId);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (error) {
    return <Text>Failed to load groups</Text>;
  }

  type Group = {
    userid: string;
    groupid: string;
    groups: {
      id: string;
      name: string;
      notes: string;
    };
  };

  const renderItem = ({ item }: { item: Group }) => (
    <Pressable
      style={styles.itemContainer}
      onPress={() =>
        router.push({
          pathname: `./groupDetails/group/${encodeURIComponent(item.groups.id)}`,
          params: {
            name: item.groups.name,
            notes: item.groups.notes,
          },
        })
      }
    >
      <Text style={styles.groupName}>{item.groups.name}</Text>
      {/* <Text style={styles.description}>{item.groups.notes}</Text> */}
    </Pressable>
  );

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
        data={groupsData || []}
        keyExtractor={(item) => item.groups.id} // Assuming 'id' is unique
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
      <Pressable style={styles.button} onPress={handleCreateNewGroup}>
        <Text style={styles.buttonText}>Create New Group</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={handleJoinGroup}>
        <Text style={styles.buttonText}>Join a Group</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20, // Add padding around the container
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
    paddingBottom: 20,
  },
  itemContainer: {
    width: '100%',
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#D4F0DD',
    borderRadius: 10,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    // Elevation for Android
    elevation: 3,
  },
  groupName: {
    fontSize: 30,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
    textAlign: 'center', // Align text to the center
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
  button: {
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
});