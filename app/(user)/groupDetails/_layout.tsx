// /app/(user)/groupDetails/_layout.tsx
// ITU Project, "Evenmate"
// Author(s): Jakub Lůčný
// VUT FIT 2024

import React from 'react';
import { Pressable, Image} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { styles } from '@/constants/styles';
import evenmatelogo from '@/assets/images/Evenmatelogo_1.png';
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

export default function GroupsStack() {
  const router = useRouter();
  const [catModalVisible, setCatModalVisible] = useState(false); // State for controlling the modal

  return (
  <>
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Groups',
          headerTitleAlign: 'center',
          headerLeft: () => (
            <Pressable style={styles.iconhitbox} onPress={() => setCatModalVisible(true)}> {/* Cat easter egg trigger */}
              <Image source={evenmatelogo} style={styles.evenmatelogo} />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable 
              onPress={() => router.push('/account')}
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
        name="group"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="createGroup"
        options={{
          title: 'Create Group',
          headerTitleAlign: 'center', // Center the title
        }}
      />
      <Stack.Screen
        name="joinGroup"
        options={{
          title: 'Join Group',
          headerTitleAlign: 'center', // Center the title
        }}
      />
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