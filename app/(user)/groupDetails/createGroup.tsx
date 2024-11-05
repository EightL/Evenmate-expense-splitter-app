// app/(user)/groupDetails/createGroup.tsx
import React, { useState } from 'react';
import { 
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert, 
  ActivityIndicator, 
  ScrollView 
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useQueryClient, InvalidateQueryFilters  } from '@tanstack/react-query';


export default function CreateGroupScreen() {
  const router = useRouter();
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();


  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Validation Error', 'Please enter a group name.');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      if (!userId) {
        Alert.alert('Authentication Error', 'You must be logged in to create a group.');
        return;
      }

      const { data: newGroup, error: groupError } = await supabase
        .from('groups')
        .insert({
          name: groupName,
          // notes: description,
          creator_id: userId,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (groupError) {
        throw groupError;
      }

      const { error: membershipError } = await supabase
        .from('rel_ingroup')
        .insert({
          groupid: newGroup.id,
          userid: userId,
          joined_at: new Date().toISOString(),
        });

      if (membershipError) {
        throw membershipError;
      }

      // console.log("USERID in CreateGroup: ", userId);
      queryClient.invalidateQueries({ queryKey: ['groupslist', userId] });

      Alert.alert('Success', 'Group created successfully.');
      router.back();
    } catch (error: any) {
      console.error('Error creating group:', error.message);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create New Group</Text>
      <TextInput
        style={styles.input}
        placeholder="Group Name"
        value={groupName}
        onChangeText={setGroupName}
        autoCapitalize="words"
      />
      {/* <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        textAlignVertical="top"
      /> */}
      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : (
        <Pressable style={styles.button} onPress={handleCreateGroup}>
          <Text style={styles.buttonText}>Create Group</Text>
        </Pressable>
      )}
    </ScrollView>
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