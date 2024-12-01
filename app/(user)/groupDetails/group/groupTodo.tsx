import React, { useState } from 'react';
import {
  StyleSheet,
  FlatList,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Animated,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useNavigation } from 'expo-router';
import evenmatelogo from '@/assets/images/Evenmatelogo_1.png';
import { useLayoutEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTodoList, createTodo, changeTodoStatus } from '@/api/todo';


type TodoItem = {
  id: string;
  name: string;
  done: boolean;
};

export default function TodoScreen() {
    const router = useRouter();
    const { groupId } = useLocalSearchParams();
    const navigation = useNavigation();
    const { data: TodoList, error, isLoading } = useTodoList(groupId);
  
    const [todos, setTodos] = useState<TodoItem[]>([]);
    const [newTodoText, setNewTodoText] = useState('');
    const [isModalVisible, setModalVisible] = useState(false);
    const slideAnim = useState(new Animated.Value(0))[0];
  
    // Header button and logo
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

    React.useEffect(() => {
      if (TodoList) {
        setTodos(TodoList);
      }
    }, [TodoList]);
  
    // Changing state of ToDo from done<-->notDone
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
  
    // Adds new ToDo
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
  
    // Renders all the ToDos for the group
    const renderTodoItem = ({ item }: { item: TodoItem }) => (
        <TouchableOpacity
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
        </TouchableOpacity>
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
          <TouchableOpacity style={styles.addButton} onPress={openModal}>
            <Text style={styles.addButtonText}>Add New To-Do</Text>
          </TouchableOpacity>
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
                  <TouchableOpacity style={styles.modalButton} onPress={addTodo}>
                    <Text style={styles.modalButtonText}>Add</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={closeModal}>
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
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
    backgroundColor: '#D4DDD7', // Light green
  },
  todoNotDone: {
    backgroundColor: '#D4F0DD', // Dark green
  },
  todoTextNotDone: {
    fontWeight: 'bold',
    color: '#000',
  },
  evenmatelogo: {
    width: 33,
    height: 27,
    marginRight: 0,
    resizeMode: 'cover',
    overflow: 'hidden',
  },
});
