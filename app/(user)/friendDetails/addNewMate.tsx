// app/(user)/friendDetails/addNewMate.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function AddNewMateScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const [loading, setLoading] = useState(false);

  const handleAddMate = async () => {
    // Input Validation
    if (!email.trim()) {
      Alert.alert('Validation Error', 'Please enter an email address.');
      return;
    }

    // Simple Email Format Validation
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      // Get current user's ID
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      const userId = user?.id;

      if (!userId) {
        throw new Error('User is not authenticated.');
      }

      // Check if the email already exists in profiles
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116: No rows found
        throw fetchError;
      }

      if (existingProfile) {
        // Optional: Check if the relationship already exists to prevent duplicates
        const { data: existingRelationship, error: relError } = await supabase
          .from('rel_uubalance')
          .select('*')
          .or(`user1.eq.${userId},user2.eq.${userId}`)
          .eq('user1', existingProfile.id)
          .or(`user2.eq.${existingProfile.id}`)
          .maybeSingle();

        if (relError && relError.code !== 'PGRST116') {
          throw relError;
        }

        if (existingRelationship) {
          Alert.alert('Info', 'You are already mates with this user.');
        } else {
          // Create a new mate relationship
          await createMateRelationship(existingProfile.id, userId);
          Alert.alert('Success', 'Mate added successfully.');
        }
      } else {
        // Profile does not exist, optionally handle inviting the user
        Alert.alert(
          'User Not Found',
          'No user found with this email address. You can invite them to join the app.'
        );
        // Optionally, implement invite functionality here
      }

      // Navigate back to the Mates screen after adding
      router.back();
    } catch (error: any) {
      console.error('Error adding mate:', error.message);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const createMateRelationship = async (mateId: string, userId: string) => {
    // Insert a new row into the mates relationship table
    const { error: error1 } = await supabase
      .from('rel_uubalance')
      .insert([
        {
          user1: userId,
          user2: mateId,
          balance: 0, // Initialize balance as needed
        },
      ]);

    if (error1) {
      throw error1;
    }

    // Insert a new row into the mates relationship table
    const { error } = await supabase
      .from('rel_uubalance')
      .insert([
        {
          user1: mateId,
          user2: userId,
          balance: 0, // Initialize balance as needed
        },
      ]);

    if (error) {
      throw error;
    }

  };

  return (
    <View style={styles.container}>
    <Stack.Screen options={{ title: 'New contact' }} />
      <Text style={styles.title}>Add Mate</Text>

      <TextInput
        style={styles.input}
        placeholder="Email Address"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : (
        <Pressable style={styles.button} onPress={handleAddMate}>
          <Text style={styles.buttonText}>Add</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
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