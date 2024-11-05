// app/(user)/groupDetails/group/groupNotes.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';

type GroupNotesProps = {};

const GroupNotes: React.FC<GroupNotesProps> = () => {
  const router = useRouter();
  const { id, name } = useLocalSearchParams(); // Assuming 'id' is passed as a route parameter

  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch notes when the component mounts
  useEffect(() => {
    const fetchNotes = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('groups') // Replace with your actual table name
          .select('notes')
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        setNotes(data.notes || '');
      } catch (err: any) {
        setError(err.message || 'Failed to fetch notes.');
        Alert.alert('Error', err.message || 'Failed to fetch notes.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchNotes();
    } else {
      setError('No group ID provided.');
      Alert.alert('Error', 'No group ID provided.');
    }
  }, [id]);

  // Handler to save notes
  const handleSaveNotes = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('groups') // Replace with your actual table name
        .update({ notes })
        .eq('id', id);

      if (error) {
        throw error;
      }

      Alert.alert('Success', 'Notes have been updated.');
      router.back(); // Navigate back to the previous screen
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save notes.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Group Notes</Text>
      <TextInput
        style={styles.textInput}
        multiline
        numberOfLines={10}
        value={notes}
        onChangeText={setNotes}
        placeholder="Enter your notes here..."
        placeholderTextColor="#999"
        editable={!isSaving}
      />
      <Pressable
        style={[styles.saveButton, { backgroundColor: isSaving ? '#ccc' : '#4CAF50' }]}
        onPress={handleSaveNotes}
        disabled={isSaving}
      >
        {isSaving ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save Notes</Text>
        )}
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f2f2f2',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  textInput: {
    height: 200,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'top',
  },
  saveButton: {
    marginTop: 20,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GroupNotes;