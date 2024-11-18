
// app/(user)/groupDetails/groupSettings.tsx
import 'react-native-get-random-values'
import { Buffer } from 'buffer';
global.Buffer = Buffer;

import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  Pressable, 
  Alert, 
  TextInput,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigation } from 'expo-router';
import { useGetCurrentUserId } from '@/api/getCurrentUserId';
import { leaveGroup, updateGroupSetting } from '@/api/groups'; // Ensure updateGroupName is implemented
import { useGroupInfo } from '@/api/groups';
import defaultGroupPic from '@/assets/images/defaultGroupPic.png';
import { supabase }  from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export default function groupSettings() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const navigation = useNavigation();
  const [selectedGroupImage, setSelectedGroupImage] = useState<string | null>(null);
  const [isGroupImageLoading, setGroupImageLoading] = useState(false);
  const [isGroupImageUploading, setGroupImageUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const [groupName, setGroupName] = useState('');

  const { data: currentUserId, error: currentUserError } = useGetCurrentUserId();
  const { data: groupData, error: groupError } = useGroupInfo(groupId);

  console.log("groupdata: ", groupData);
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
      setSelectedGroupImage(result.assets[0].uri);
    } else {
      Alert.alert("No Image Selected", "Please select an image to upload.");
    }
  };

  const fetchBlob = async (uri: string): Promise<Uint8Array> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        const arrayBuffer = xhr.response;
        if (arrayBuffer) {
          const uint8Array = new Uint8Array(arrayBuffer);
          resolve(uint8Array);
        } else {
          reject(new Error('Failed to fetch blob'));
        }
      };
      xhr.onerror = function (e) {
        console.error('XHR Error:', e);
        reject(new TypeError('Network request failed'));
      };
      xhr.responseType = 'arraybuffer';
      xhr.open('GET', uri, true);
      xhr.send(null);
    });
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!selectedGroupImage) {
      Alert.alert("No Image Selected", "Please select an image first.");
      return null;
    }

    try {
      setLoading(true);
      console.log('Starting image upload...');

      const uint8Array = await fetchBlob(selectedGroupImage);
      if (uint8Array.length === 0) {
        throw new Error('Blob is empty.');
      }

      // Ensure that group and group.id exist
      if (!groupData || !groupData.id) {
        throw new Error('Group data is missing.');
      }

      const fileName = `group-images/${groupData.id}/group_${uuidv4()}.jpg`;
      console.log('Uploading to Supabase:', fileName);

      const { data, error: uploadError } = await supabase
        .storage
        .from('group-images')
        .upload(fileName, uint8Array, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'image/jpeg',
        });

      if (uploadError) {
        console.error('Upload Error:', uploadError);
        throw uploadError;
      }

      console.log('Upload successful:', data);

      const { data: publicData, error: urlError } = supabase
        .storage
        .from('group-images')
        .getPublicUrl(data.path);

      if (urlError) {
        throw new Error('Failed to retrieve public URL.');
      }
      
      console.log('Public URL retrieved:', publicData.publicUrl);
      return publicData.publicUrl;
    } catch (err: any) {
      console.error('Error uploading image:', err);
      Alert.alert('Error', err.message || 'An unknown error occurred.');
      return null;
    } finally {
      setLoading(false);
    }
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
    setLoading(true);

    let imageUrl = groupData.avatar_url || ''; // Assuming groupData has avatar_url
    console.log('Initial imageUrl:', imageUrl);

    if (selectedGroupImage) {
      console.log('Selected group image URI:', selectedGroupImage);

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
    // Assuming you have an API function to update group info
    
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
      <View>
        {isGroupImageUploading ? (
          <ActivityIndicator size="large" color="#4CAF50" />
        ) : (
          <Pressable onPress={handleGroupImageChange}>
            <Image
              source={
                selectedGroupImage
                  ? { uri: selectedGroupImage }
                  : groupData?.avatar_url
                  ? { uri: groupData.avatar_url }
                  : defaultGroupPic
              }
              style={styles.image}
              onLoadEnd={() => setGroupImageLoading(false)}
              onError={() => setGroupImageLoading(false)}
            />
          </Pressable>
        )}
      </View>
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