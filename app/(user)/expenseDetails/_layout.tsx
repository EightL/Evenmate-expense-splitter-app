// /app/(user)/expenseDetails/_layout.tsx
// ITU Project, "Evenmate"
// Author(s): Martin Ševčík
// VUT FIT 2024


import React, { useState } from 'react';
import { Pressable, Image, Modal, View, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { styles } from '@/constants/styles';
import evenmatelogo from '@/assets/images/Evenmatelogo_1.png'; // Import the Evenmate logo
import catImage from '@/assets/images/cat-png-40358.png'; // Import a cat image

// CatEasterEgg component
function CatEasterEgg({ visible, onClose }) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={catStyles.modalBackground}>
          <View style={catStyles.catContainer}>
            <Image source={catImage} style={catStyles.catImage} />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

export default function ExpenseStack() {
  const [catModalVisible, setCatModalVisible] = useState(false); // State for controlling the modal
  const router = useRouter();

  return (
    <>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            title: 'Add expense',
            headerTitleAlign: 'center', // Center the title
            headerLeft: () => (
              <Pressable onPress={() => setCatModalVisible(true)}> {/* Cat easter egg trigger */}
                <Image source={evenmatelogo} style={styles.evenmatelogo} />
              </Pressable>
            ),
            headerRight: () => (
              <Pressable
                onPress={() => router.push('/account')}
                accessibilityLabel="Account"
                accessibilityRole="button"
                style={{marginRight: 5}}
              >
                <FontAwesome
                  name="user"
                  size={25}
                  color="#000"
                />
              </Pressable>
            ),
          }}
        />
        <Stack.Screen
          name="selectMates"
          options={{ 
            title: 'Select mates',
            headerTitleAlign: 'center', // Center the title
           }}
        />
        <Stack.Screen
          name="account"
          options={{
            headerShown: false,
            title: 'Account',
          }}
        />
      </Stack>

      {/* Cat Easter Egg Modal */}
      <CatEasterEgg
        visible={catModalVisible}
        onClose={() => setCatModalVisible(false)}
      />
    </>
  );
}

const catStyles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  catContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  catImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
});