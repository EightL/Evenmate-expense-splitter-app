// /app/(user)/friendDetails/_layout.tsx
// ITU Project, "Evenmate"
// Author(s): Martin Ševčík
// VUT FIT 2024

import { Pressable, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import evenmatelogo from '@/assets/images/Evenmatelogo_1.png'; // Import the Evenmate logo
import { styles } from '@/constants/styles';
import catImage from '@/assets/images/cat-png-40358.png'; // Import a cat image
import { Modal, View, TouchableWithoutFeedback } from 'react-native';
import {StyleSheet} from 'react-native';
import { useState } from 'react';
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

export default function MatesStack() {
  const router = useRouter(); // Initialize the router
  const [catModalVisible, setCatModalVisible] = useState(false); // State for controlling the modal

  return (
  <>
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Mates',
          headerTitleAlign: 'center', // Center the title
          headerLeft: () => (
            <Pressable style={styles.iconhitbox} onPress={() => setCatModalVisible(true)}> {/* Cat easter egg trigger */}
              <Image source={evenmatelogo} style={styles.evenmatelogo} />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable 
              onPress={() => router.push('/account')} // Navigate to the account screen
              accessibilityLabel="Account"
              accessibilityRole="button"
              style={styles.iconhitbox}
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
        name="addNewMate"
        options={{
          title: 'New Contact',
          headerTitleAlign: 'center', // Center the title
        }}
      />
      <Stack.Screen
        name="getEvenMate"
        options={{
          title: 'Get Even',
          headerTitleAlign: 'center', // Center the title
        }}
      />
      <Stack.Screen
      name="[id]"
      options={{
        title: 'Mate',
        headerTitleAlign: 'center', // Center the title
      }}/>
    </Stack>
    
    {/* EvenCat Easter Egg Modal */}
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