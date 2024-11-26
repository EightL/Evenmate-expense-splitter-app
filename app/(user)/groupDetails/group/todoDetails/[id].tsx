import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { FontAwesome } from '@expo/vector-icons';
import { deleteTodo, updateTodo, useTodoInfo } from '@/api/todo';

export default function EditTodoScreen() {
  const router = useRouter();
  const { id: todoId } = useLocalSearchParams();
  const [todoName, setTodoName] = useState('');
  const [todoDescription, setTodoDescription] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const { data: todo, isLoading, error } = useTodoInfo(todoId);

  useEffect(() => {
    if (todo) {
      setTodoName(todo.name);
      setTodoDescription(todo.description);
    }
  }, [todo]);

  const handleDeleteTodo = async () => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this to-do?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              await deleteTodo(todoId);

              queryClient.invalidateQueries(); // Refresh queries
              router.back();
            } catch (error: any) {
              console.error('Error deleting to-do:', error.message);
              Alert.alert('Error', error.message);
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleUpdateTodo = async () => {
    if (!todoName.trim() || !todoDescription.trim()) {
      Alert.alert('Validation Error', 'Please enter both name and description.');
      return;
    }

    try {
      setIsUpdating(true);
      await updateTodo(todoId, todoName, todoDescription);

      queryClient.invalidateQueries(); // Refresh queries
      Alert.alert('Success', 'To-do updated successfully.');
      router.back();
    } catch (error: any) {
      console.error('Error updating to-do:', error.message);
      Alert.alert('Error', error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{`Error: ${error.message}`}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.title}>Edit To-Do Details</Text>
    <TextInput
      style={styles.input}
      placeholder="To-Do Name"
      value={todoName}
      onChangeText={setTodoName}
    />
    <TextInput
      style={styles.descriptionInput}
      placeholder="To-Do Description"
      value={todoDescription}
      onChangeText={setTodoDescription}
      multiline
    />
  
    {/* Other content can remain here */}
    
    <View style={styles.buttonContainer}>
      <Pressable
        style={[
          styles.updateButton,
          (isUpdating || isDeleting) && styles.buttonDisabled,
        ]}
        onPress={handleUpdateTodo}
        disabled={isUpdating || isDeleting}
      >
        {isUpdating ? (
          <ActivityIndicator />
        ) : (
          <Text style={styles.updateButtonText}>Update To-Do</Text>
        )}
      </Pressable>
  
      <Pressable
        style={[
          styles.deleteButton,
          (isUpdating || isDeleting) && styles.buttonDisabled,
        ]}
        onPress={handleDeleteTodo}
        disabled={isUpdating || isDeleting}
      >
        {isDeleting ? (
          <ActivityIndicator />
        ) : (
          <FontAwesome name="trash" size={24} color="#fff" />
        )}
      </Pressable>
    </View>
  </ScrollView>

  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
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
  updateButton: {
    backgroundColor: '#5AC07C',
    marginBottom: 10,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
  descriptionInput: {
    width: '100%',
    borderColor: '#4CAF50',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 20,
    fontSize: 16,
    height: 130, // Increase the height for the description field
    textAlignVertical: 'top',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20, // Position the buttons above the screen's bottom edge
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#FF3B30',
    paddingVertical: 15,
    marginLeft: 10, // Space between buttons
    borderRadius: 10,
    alignItems: 'center',
  },
  updateButton: {
    flex: 6,
    backgroundColor: '#5AC07C',
    paddingVertical: 15,
    marginRight: 10, // Optional spacing for symmetry
    borderRadius: 10,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
