// /app/(user)/expenseDetails/index.tsx
// ITU Project, "Evenmate"
// Author(s): Martin Ševčík
// VUT FIT 2024

import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, Keyboard, TouchableWithoutFeedback, Modal, FlatList, } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { handleUpdateBalances } from '@/api/updateBalances';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCurrentUserId } from '@/api/getCurrentUserId';
import { createExpense, insertRelOwesFor } from '@/api/expenses';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AddExpenseScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const queryClient = useQueryClient();

  // State variables
  const [expenseName, setExpenseName] = useState(params.expenseName || '');
  const [cost, setCost] = useState(params.cost || '');
  const [selectedMates, setSelectedMates] = useState<{ id: string; name: string }[] >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState('cart');
  const { data: currentUserId, error } = useGetCurrentUserId(); // Get the current user ID

  // Icon options
  const iconOptions = [
    'tree',
    'star',
    'heart',
    'gift',
    'bell',
    'silverware-fork-knife', 
    'cup',                    
    'car',                    
    'bus',                    
    'movie',                 
    'gamepad',               
    'lightbulb',             
    'heart-pulse',        
    'cart',                   
    'airplane',
    'book',
    'wallet',
    'toolbox',
    'brush',
  ];

  useEffect(() => {
    // Handle mateIds and mateNames
    if (params.mateIds && params.mateNames) {
      // Handle both string and array inputs
      const mateIdsArray =
        typeof params.mateIds === 'string'
          ? params.mateIds.split(',')
          : params.mateIds;
      const mateNamesArray =
        typeof params.mateNames === 'string'
          ? params.mateNames.split(',')
          : params.mateNames;

      const mates = mateIdsArray.map((id: string, index: number) => ({
        id,
        name: mateNamesArray[index],
      
      }));

      const newSelectedIcon = params.icon; // Default icon
      // Prevent setting state if mates are already selected
      const isSameLength = mates.length === selectedMates.length;
      const isSameMates = isSameLength && mates.every((mate, idx) => mate.id === selectedMates[idx]?.id && mate.name === selectedMates[idx]?.name );
      if (!isSameMates) {
        setSelectedMates(mates);
      }
    }
    
    // Handle icon
    if (params.icon && params.icon !== selectedIcon) {
      setSelectedIcon(params.icon);
    }
  }, [params.mateIds, params.mateNames, params.icon]);

  const handleAddMates = () => {
    router.push({
      pathname: '/expenseDetails/selectMates',
      params: {
        expenseName,
        cost,
        selectedIcon : selectedIcon,
      },
    });
  };

  const handleSubmitExpense = async () => {
    // Input validation
    if (!expenseName.trim() || !cost.trim()) {
      Alert.alert('Validation Error', 'Please enter both expense name and cost.');
      return;
    }
    const numericCost = parseFloat(cost);
    if (isNaN(numericCost) || numericCost <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid cost.');
      return;
    }
    
    // Submit the expense
    try {
      setIsSubmitting(true);

      const participantCount = selectedMates.length + 1; // Including the current user
      const share = numericCost / participantCount;
      const mateIds = selectedMates.map((mate) => mate.id);

      // Update balances
      await handleUpdateBalances({
        currentUserId,
        mateIds,
        share,
      });

      // Create the expense and get the expense ID
      const expenseId = await createExpense({
        expenseName,
        numericCost,
        currentUserId,
        groupId: params.groupId,
        participantCount,
        icon: selectedIcon,
      });

      // Insert into Rel_owesFor for each mate
      await insertRelOwesFor(expenseId, mateIds);

      // Reset query keys
      queryClient.invalidateQueries({ queryKey: ['mates', currentUserId] });
      queryClient.invalidateQueries({ queryKey: ['groupExpenses', params.groupId] });
      for (const mate of selectedMates) {
        queryClient.invalidateQueries({ queryKey: ['mateExpenses', currentUserId, mate] });
      }
      
      // Reset the form
      setExpenseName('');
      setCost('');
      setSelectedMates([]);

      
      Alert.alert('Success', 'Expense added successfully.');
      if (params.groupId) {
        router.push({
          pathname: '/(user)/groupDetails',
          params: {
            id: params.groupId,
          },
        });
      } else{
        router.push({
          pathname: '/(user)/friendDetails',
        });
      }
    } catch (error: any) {
      console.error('Error submitting expense:', error.message);
      Alert.alert('Error', error.message);
    } finally {
      setIsSubmitting(false); // Reset the state
    }
  };
  
  
  return (
    // Dismiss the keyboard when tapping outside the input
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      {/* Main container */}
      <View style={styles.container}>
        <Text style={styles.title}>Add Expense</Text>
        <View style={styles.mainContainer}>
          {/* First container */}
          <View style={styles.rowContainer}>
            <TextInput
              style={styles.inputContainer}
              placeholder="Expense Name"
              value={expenseName}
              onChangeText={setExpenseName}
            />
            <TouchableOpacity style={styles.iconContainer} onPress={() => setModalVisible(true)}>
              <MaterialCommunityIcons name={selectedIcon} size={30} color="black" />
            </TouchableOpacity>
            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
            >
              <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Select an Icon</Text>
                    <FlatList
                      data={iconOptions}
                      keyExtractor={(item, index) => `${item}-${index}`} // Ensuring unique keys
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={[
                            styles.iconOption,
                            item === selectedIcon && styles.selectedIconOption
                          ]}
                          onPress={() => {
                            setSelectedIcon(item);
                            setModalVisible(false);
                          }}
                        >
                          <MaterialCommunityIcons name={item} size={30} color="black" />
                        </TouchableOpacity>
                      )}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ paddingHorizontal: 10 }}
                    />
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setModalVisible(false)}
                    >
                      <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </Modal>
          </View>

          {/* Second container */}
          <View style={styles.rowContainer}>
            <TextInput
              style={styles.inputContainer}
              placeholder="Cost"
              value={cost}
              onChangeText={setCost}
              keyboardType="numeric"
            />
            <View style={styles.iconContainer}>
              <Text style={styles.currencyText}>CZK</Text>
            </View>
          </View>
        </View>
        <View style={styles.splitWithContainer}>
          <Text style={styles.splitWithText}>Split with:</Text>
          <View style={styles.matesContainer}>
            {selectedMates.map((mate) => (
              <View key={mate.id} style={styles.mateBubble}>
                <Text style={styles.mateName}>{mate.name}</Text>
              </View>
            ))}
            <TouchableOpacity style={styles.addButton} onPress={handleAddMates}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!expenseName || !cost || selectedMates.length === 0 || isSubmitting) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmitExpense}
          disabled={!expenseName || !cost || selectedMates.length === 0 || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff"/>
          ) : (
            <Text style={styles.submitButtonText}>Submit Expense</Text>
          )}
        </TouchableOpacity>
      </View>
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
  splitWithContainer: {
    marginBottom: 20,
  },
  splitWithText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  matesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  mateBubble: {
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 5,
    marginBottom: 5,
  },
  mateName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 20,
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  mainContainer:{
    marginBottom: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  rowContainer: {
    flexDirection: 'row',
    marginVertical: 5,
  },
  inputContainer: {
    flex: 5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: '#D4F0DD',
    borderRadius: 10,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 20,
  },
  iconContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    marginLeft: 5,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  currencyText: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  iconOption: {
    padding: 10,
    alignItems: 'center',
  },
  selectedIconOption: { // New style for selected icon
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 15,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#A3D6A3',
    borderRadius: 5,
    width: '100%',
  },
  closeButtonText: {
    fontSize: 16,
  },
});