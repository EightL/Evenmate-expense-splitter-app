import React, { useState } from 'react';
import { 
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert, 
  ActivityIndicator, 
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient, InvalidateQueryFilters } from '@tanstack/react-query';
import { useGetCurrentUserId } from '@/api/getCurrentUserId';
import { createGroup, addUserToGroup } from '@/api/groups';


export default function CreateGroupScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: currentUserId } = useGetCurrentUserId();

  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);


  // When user clicks on create group button
  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Validation Error', 'Please enter a group name.');
      return;
    }

    setLoading(true);

    try {
      // Create group and add user to the group
      const newGroup = await createGroup(groupName, currentUserId);
      await addUserToGroup(newGroup.id, currentUserId);

      // Refresh data
      queryClient.invalidateQueries();
      router.back();

    }
    catch (error: any) {
      console.error('Error creating group:', error.message);
      Alert.alert('Error', error.message);
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create New Group</Text>
      <TextInput
        style={styles.input}
        placeholder="Group Name"
        value={groupName}
        onChangeText={setGroupName}
        autoCapitalize="words"
      />
      {loading ? (<ActivityIndicator/>) : (
        <Pressable style={styles.button} onPress={handleCreateGroup}>
          <Text style={styles.buttonText}>Create Group</Text>
        </Pressable>
      )}
    </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    marginTop: 10,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    borderColor: '#4CAF50',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});