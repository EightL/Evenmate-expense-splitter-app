// app/(user)/groups/createGroup.tsx
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

export default function CreateGroupScreen() {
  const router = useRouter();

  const [groupId, setGroupId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoinGroup = async () => {
    // Input Validation
    if (!groupId.trim()) {
      Alert.alert('Validation Error', 'Please enter a Group ID.');
      return;
    }

    const parsedGroupId = parseInt(groupId, 10);
    if (isNaN(parsedGroupId) || parsedGroupId <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid positive number for Group ID.');
      return;
    }

    setLoading(true);

    try {
      // Fetch the group to ensure it exists
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', parsedGroupId)
        .single();

      if (groupError) {
        if (groupError.code === 'PGRST116') { // No rows found
          Alert.alert('Group Not Found', `No group found with ID ${parsedGroupId}.`);
        } else {
          throw groupError;
        }
        return;
      }

      // Get current user's ID
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user.id;

      if (!userId) {
        Alert.alert('Authentication Error', 'You must be logged in to join a group.');
        return;
      }

      // Check if the user is already a member of the group
      const { data: existingMembership, error: membershipError } = await supabase
        .from('rel_ingroup')
        .select('*')
        .eq('userid', userId)
        .eq('groupid', parsedGroupId)
        .single();

      if (membershipError && membershipError.code !== 'PGRST116') { // Ignore no rows found
        throw membershipError;
      }

      if (existingMembership) {
        Alert.alert('Already a Member', 'You are already a member of this group.');
        return;
      }

      // Insert a new membership
      const { error: insertError } = await supabase
        .from('rel_ingroup')
        .insert([
          {
            userid: userId,
            groupid: parsedGroupId,
            joined_at: new Date().toISOString(),
          },
        ]);

      if (insertError) {
        throw insertError;
      }

      Alert.alert('Success', `You have successfully joined Group ID ${parsedGroupId}.`);
      router.back(); // Navigate back to the previous screen
    } catch (error: any) {
      console.error('Error joining group:', error.message);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Join Group</Text>

      <TextInput
        style={styles.input}
        placeholder="Group ID"
        value={groupId}
        onChangeText={setGroupId}
        keyboardType="numeric"
      />

      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : (
        <Pressable style={styles.button} onPress={handleJoinGroup}>
          <Text style={styles.buttonText}>Join Group</Text>
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
    height: 50,
    borderColor: '#4CAF50',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 25,
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