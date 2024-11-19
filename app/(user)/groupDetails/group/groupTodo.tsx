import React, { useState } from 'react';
import {
  StyleSheet,
  FlatList,
  View,
  Text,
  TextInput,
  Pressable,
  TouchableOpacity,
  Modal,
  Animated,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTodoList, createTodo, changeTodoStatus } from '@/api/todo';


type TodoItem = {
  id: string;
  name: string;
  done: boolean;
};

export default function TodoScreen() {
    const router = useRouter();
    const { groupId } = useLocalSearchParams();
    const { data: TodoList, error, isLoading } = useTodoList(groupId);
  
    const [todos, setTodos] = useState<TodoItem[]>([]);
    const [newTodoText, setNewTodoText] = useState('');
    const [isModalVisible, setModalVisible] = useState(false);
    const slideAnim = useState(new Animated.Value(0))[0];
  
    React.useEffect(() => {
      if (TodoList) {
        setTodos(TodoList);
      }
    }, [TodoList]);
  
    const toggleTodo = async (id: string, currentDone: boolean) => {
      try {
        await changeTodoStatus(id, !currentDone);
        setTodos((prevTodos) =>
          prevTodos.map((todo) =>
            todo.id === id ? { ...todo, done: !currentDone } : todo
          )
        );
      } catch (error) {
        console.error('Error toggling todo:', error);
      }
    };
  
    const addTodo = async () => {
      if (!newTodoText.trim()) return;
  
      try {
        const newTodo: TodoItem = await createTodo(newTodoText, groupId);
        setTodos((prevTodos) => [newTodo, ...prevTodos]);
        setNewTodoText('');
        closeModal();
      } catch (error) {
        console.error('Error creating todo:', error);
      }
    };
  
    const openModal = () => {
      setModalVisible(true);
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    };
  
    const closeModal = () => {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setModalVisible(false);
      });
    };
  
    const renderTodoItem = ({ item }: { item: TodoItem }) => (
        <Pressable
          style={[
            styles.todoItem,
            item.done ? styles.todoDone : styles.todoNotDone,
          ]}
          onPress={() => router.push(`/groupDetails/group/todoDetails/${item.id}`)}
        >
          <TouchableOpacity onPress={() => toggleTodo(item.id, item.done)} style={styles.checkbox}>
            {item.done && <Text style={styles.checkboxText}>✔</Text>}
          </TouchableOpacity>
          <Text
            style={[
              styles.todoText,
              item.done ? styles.todoTextDone : styles.todoTextNotDone,
            ]}
          >
            {item.name}
          </Text>
        </Pressable>
      );
  
    if (isLoading) {
      return <Text>Loading...</Text>;
    }
  
    if (error) {
      return <Text>Error loading todos</Text>;
    }
  
    return (
      <View style={styles.container}>
        <Text style={styles.title}>To-Do List</Text>
  
        <FlatList
          data={todos}
          keyExtractor={(item) => item.id}
          renderItem={renderTodoItem}
          contentContainerStyle={styles.listContainer}
        />
  
        {!isModalVisible && (
          <Pressable style={styles.addButton} onPress={openModal}>
            <Text style={styles.addButtonText}>Add New To-Do</Text>
          </Pressable>
        )}
  
        <Modal visible={isModalVisible} transparent animationType="none">
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPressOut={closeModal}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
              <Animated.View
                style={[
                  styles.modalContainer,
                  {
                    transform: [
                      {
                        translateY: slideAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [300, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Text style={styles.modalTitle}>New To-Do</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter task"
                  value={newTodoText}
                  onChangeText={setNewTodoText}
                />
                <View style={styles.modalButtonsContainer}>
                  <Pressable style={styles.modalButton} onPress={addTodo}>
                    <Text style={styles.modalButtonText}>Add</Text>
                  </Pressable>
                  <Pressable style={[styles.modalButton, styles.cancelButton]} onPress={closeModal}>
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </Pressable>
                </View>
              </Animated.View>
            </TouchableWithoutFeedback>
          </TouchableOpacity>
        </Modal>
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
    marginBottom: 20,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingBottom: 20,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  checkbox: {
    width: 30,
    height: 30,
    borderWidth: 2,
    borderRadius: 4,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  checkboxText: {
    fontSize: 20,
    color: '#4CAF50',
  },
  titleSmaller:{
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    
  },
  todoText: {
    fontSize: 16,
    flex: 1,
  },
  todoTextDone: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  modalOverlay: {
    flex: 0.8,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalOverlayIOS: {
    flex: 0.6,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 15,
  },
  inputDescription: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 15,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  todoDone: {
    backgroundColor: '#D4DDD7', // Light green for done todos
  },
  todoNotDone: {
    backgroundColor: '#D4F0DD', // Dark green for not done todos
  },
  todoTextNotDone: {
    fontWeight: 'bold', // Bold text for not done todos
    color: '#000', // White text for better visibility on dark green background
  },
});
