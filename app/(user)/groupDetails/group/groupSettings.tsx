import 'react-native-get-random-values'
import { Buffer } from 'buffer';
global.Buffer = Buffer;

import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  Alert, 
  TextInput,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigation } from 'expo-router';
import defaultGroupPic from '@/assets/images/defaultGroupPic.png';
import { v4 as uuidv4 } from 'uuid';
import { useLayoutEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import evenmatelogo from '@/assets/images/Evenmatelogo_1.png';
import { useGetCurrentUserId } from '@/api/getCurrentUserId';
import { leaveGroup, updateGroupSetting } from '@/api/groups';
import { useGroupInfo } from '@/api/groups';
import { uploadGroupImage } from '@/api/profiles';


export default function groupSettings() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const navigation = useNavigation();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isGroupImageLoading, setGroupImageLoading] = useState(false);
  const [isGroupImageUploading, setGroupImageUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [groupName, setGroupName] = useState('');

  const { data: currentUserId, error: currentUserError } = useGetCurrentUserId();
  const { data: groupData, error: groupError } = useGroupInfo(groupId);

  // Initialize groupName with groupData.name when groupData is loaded
  useEffect(() => {
    if (groupData && groupData.name) {
      setGroupName(groupData.name);
    }
  }, [groupData]);

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

  // Changing group picture
  const handleGroupImageChange = async () => {
    // Request permission to access the media library
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
    if (!permissionResult.granted) {
      Alert.alert("Permission Denied", "Permission to access camera roll is required!");
      return;
    }
  
    // Launch the image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
  
    // Check if the user canceled the picker or if assets are available
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
    } else {
      Alert.alert("No Image Selected", "Please select an image to upload.");
    }
  };


  const uploadImage = async (): Promise<string | null> => {
    if (!selectedImage) {
      Alert.alert("No Image Selected", "Please select an image first.");
      return null;
    }

    try {
      setLoading(true);
      console.log('Starting image upload...');

      // Ensure that group and group.id exist
      if (!groupData || !groupData.id) {
        throw new Error('Group data is missing.');
      }

      const fileName = `group-images/${groupData.id}/group_${uuidv4()}.jpg`;
      console.log('Uploading to Supabase:', fileName);

      const publicURL = await uploadGroupImage(fileName, currentUserId, selectedImage);

      return publicURL;
    } catch (err: any) {
      console.error('Error uploading image:', err);
      Alert.alert('Error', err.message || 'An unknown error occurred.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Handeling leaving a group
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
    setLoading(true);

    let imageUrl = groupData.avatar_url || '';
    console.log('Initial imageUrl:', imageUrl);

    if (selectedImage) {
      console.log('Selected group image URI:', selectedImage);

      const uploadedURL = await uploadImage();
      console.log('Uploaded group image URL:', uploadedURL);
      if (uploadedURL) {
        imageUrl = uploadedURL;
        console.log('Uploaded group image URL:', imageUrl);
      } else {
        throw new Error('Failed to upload group image.');
      }
    }

    // Update group details with new name and image URL    
    await updateGroupSetting(groupId, groupName, imageUrl);

    Alert.alert('Success', 'Group details have been updated.');
  } catch (err: any) {
    console.error('Error saving group details:', err);
    Alert.alert('Error', err.message || 'An unknown error occurred.');
  } finally {
    setLoading(false);
  }
};

  if (!groupId) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Group ID not found.</Text>
      </View>
    );
  }

  const qrData = groupId;

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
      <View>
        {isGroupImageUploading ? (
          <ActivityIndicator size="large" color="#4CAF50" />
        ) : (
          <TouchableOpacity onPress={handleGroupImageChange}>
            <Image
              source={
                selectedImage
                  ? { uri: selectedImage }
                  : groupData?.avatar_url
                  ? { uri: groupData.avatar_url }
                  : defaultGroupPic
              }
              style={styles.image}
              onLoadEnd={() => setGroupImageLoading(false)}
              onError={() => setGroupImageLoading(false)}
            />
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveDetails}>
        <Text style={styles.saveButtonText}>Save Details</Text>
      </TouchableOpacity>

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
      <TouchableOpacity style={styles.leaveButton} onPress={handleLeaveGroup}>
        <Text style={styles.leaveButtonText}>Leave Group</Text>
      </TouchableOpacity>
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
  evenmatelogo: {
    width: 33,
    height: 27,
    marginRight: 0,
    resizeMode: 'cover',
    overflow: 'hidden',
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
  image: {
    width: 250,
    height: 150,
    aspectRatio: 16 / 9,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});