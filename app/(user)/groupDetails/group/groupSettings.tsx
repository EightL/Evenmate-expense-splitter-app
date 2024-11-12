// app/(user)/groupDetails/groupSettings.tsx

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  Pressable, 
  Alert, 
  TextInput,
  ScrollView, 
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCurrentUserId } from '@/api/getCurrentUserId';
import { leaveGroup, updateGroupSetting } from '@/api/groups'; // Ensure updateGroupName is implemented
import { useGroupInfo } from '@/api/groups';

export default function InviteGroupScreen() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const queryClient = useQueryClient();
  const [groupName, setGroupName] = useState('');
  const { data: currentUserId, error: currentUserError } = useGetCurrentUserId();
  const { data: groupData, error: groupError } = useGroupInfo(groupId);

  // Initialize groupName with groupData.name when groupData is loaded
  useEffect(() => {
    if (groupData && groupData.name) {
      setGroupName(groupData.name);
    }
  }, [groupData]);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(groupId);
    Alert.alert('Copied!', 'Group ID has been copied to your clipboard.');
  };

  const handleLeaveGroup = () => {
    Alert.alert(
      'Leave Group',
      'Are you sure you want to leave this group?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await leaveGroup(currentUserId, groupId);
              queryClient.invalidateQueries(['groupslist', currentUserId]);
              Alert.alert('Success', 'You have left the group.');
              router.back();
              router.back();
            } catch (error: any) {
              console.error('Error leaving group:', error.message);
              Alert.alert('Error', error.message);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleGroupNameChange = (text: string) => {
    setGroupName(text);
  };

  const handleSaveDetails = async () => {
    if (groupName.trim() === '') {
      Alert.alert('Validation Error', 'Group name cannot be empty.');
      return;
    }
    try {
      // Replace with your actual API call to update the group name
      await updateGroupSetting(groupId, groupName);
      queryClient.invalidateQueries();
      Alert.alert('Success', 'Group details have been saved.');
      router.back();
    } catch (error: any) {
      console.error('Error saving group details:', error.message);
      Alert.alert('Error', error.message);
    }
  };

  if (!groupId) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Group ID not found.</Text>
      </View>
    );
  }

  const qrData = groupId; // Customize as needed

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {/* Edit Group Info Section */}
      <Text style={styles.editHeader}>Edit Group Info</Text>
      <TextInput
        style={styles.input}
        placeholder="Group Name"
        value={groupName}
        onChangeText={handleGroupNameChange}
        autoCapitalize="none"
      />
      <Pressable style={styles.saveButton} onPress={handleSaveDetails}>
        <Text style={styles.saveButtonText}>Save Details</Text>
      </Pressable>

      {/* Invite to Group Section */}
      <Text style={styles.title}>Invite to Group</Text>
      <Text style={styles.subtitle}>Scan this QR code to join the group:</Text>
      <View style={styles.qrContainer}>
        <QRCode
          value={qrData}
          size={Dimensions.get('window').width * 0.6}
          color="#4CAF50"
          backgroundColor="#ffffff"
        />
      </View>

      {/* Leave Group Button */}
      <Pressable style={styles.leaveButton} onPress={handleLeaveGroup}>
        <Text style={styles.leaveButtonText}>Leave Group</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  qrContainer: {
    marginVertical: 20,
    padding: 10,
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
  },
  leaveButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  leaveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  editHeader: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 30,
    marginBottom: 10,
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
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  copyContainer: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#E0F7E9',
    alignItems: 'center',
    marginTop: 10,
  },
  groupIdLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
    textAlign: 'center',
  },
  groupId: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginTop: 5,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
});