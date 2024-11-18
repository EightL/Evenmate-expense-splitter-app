import 'react-native-get-random-values'; // Import the polyfill first
import { Buffer } from 'buffer';

// Set up Buffer globally
// @ts-ignore
global.Buffer = Buffer;

import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  Image,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { useUserInfo, useUpdateProfile } from '@/api/profiles';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useGetCurrentUserId } from '@/api/getCurrentUserId';
import * as ImagePicker from 'expo-image-picker';
import defaultProfilePic from '@/assets/images/defaultProfilePic.png';

import { v4 as uuidv4 } from 'uuid'; // Import the uuid library correctly

const AccountSettings = () => {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { data: currentUserId, error } = useGetCurrentUserId();
  const [loading, setLoading] = useState(false);
  const [isImageLoading, setImageLoading] = useState(true);

  const {
    data: profile,
    isLoading: isProfileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useUserInfo(currentUserId || null);


  const [user, setUser] = useState({
    username: '',
    bankAccount: '',
    email: '',
    avatar_url: '',
  });

  const originalUserRef = useRef({
    username: '',
    bankAccount: '',
    email: '',
    avatar_url: '',
  });

  useEffect(() => {
    if (profile) {
      setUser({
        username: profile.username || '',
        bankAccount: profile.bank_account || '',
        email: profile.email || '',
        avatar_url: profile.avatar_url || '',
      });
      originalUserRef.current = {
        username: profile.username || '',
        bankAccount: profile.bank_account || '',
        email: profile.email || '',
        avatar_url: profile.avatar_url || '',
      };
    }
  }, [profile]);

  const handleNameChange = (text: string) => {
    setUser((prev) => ({ ...prev, username: text }));
  };

  const handleBankAccountChange = (text: string) => {
    setUser((prev) => ({ ...prev, bankAccount: text }));
  };

  const pickImage = async () => {
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
      
    }
  };

  const isEdited =
    user.username !== originalUserRef.current.username ||
    user.bankAccount !== originalUserRef.current.bankAccount ||
    selectedImage !== null;

  const fetchBlob = async (uri: string): Promise<Uint8Array> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        const arrayBuffer = xhr.response;
        const uint8Array = new Uint8Array(arrayBuffer);
        resolve(uint8Array);
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
    if (!selectedImage) {
      Alert.alert("No Image Selected", "Please select an image first.");
      return null;
    }
  
    try {
      setLoading(true);
      console.log('Starting image upload...');
  
      const uint8Array = await fetchBlob(selectedImage);
      if (uint8Array.length === 0) {
        throw new Error('Blob is empty.');
      }
  
      const fileName = `avatars/${currentUserId}/profile_${uuidv4()}.jpg`;
      console.log('Uploading to Supabase:', fileName);
  
      const { data, error: uploadError } = await supabase
        .storage
        .from('avatars')
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
  
      // Log the data.path to verify the path
      console.log('Uploaded file path:', data.path);
  
      const publicURL = `https://fcxvtpbbexwjimojbbcy.supabase.co/storage/v1/object/public/avatars/${data.path}`;

      
      console.log('Public URL retrieved:', publicURL);
      return publicURL;
    } catch (err: any) {
      console.error('Error uploading image:', err);
      Alert.alert('Error', err.message || 'An unknown error occurred.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDetails = async () => {
    try {
      setLoading(true);
  
      let imageUrl = user.avatar_url || profile.avatar_url;
      console.log('Initial imageUrl:', imageUrl);
  
      if (selectedImage) {
        console.log('Selected image URI:', selectedImage);
  
        const uploadedURL = await uploadImage();
        if (uploadedURL) {
          imageUrl = uploadedURL;
          console.log('Uploaded image URL:', imageUrl);
        } else {
          throw new Error('Failed to obtain uploaded image URL.');
        }
      }
  
      console.log('Updating profile with imageUrl:', imageUrl);
  
      await useUpdateProfile({
        id: profile.id,
        username: user.username,
        bankAccount: user.bankAccount,
        avatar_url: imageUrl,
      });
      
    } catch (err: any) {
      console.error('Error saving details:', err);
      Alert.alert('Error', err.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
      refetchProfile();
      router.back();
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      router.replace('/(auth)/sign-in'); // Navigate to login screen
    }
  };

  if (isProfileLoading || loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (profileError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Failed to load account details.</Text>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); }} accessible={false}>
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.mainHeading}>Edit account info</Text>
      </View>
  
      <View style={styles.container2}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Name:</Text>
          <TextInput
            style={styles.input}
            value={user.username}
            onChangeText={handleNameChange}
            placeholder="Enter your name"
            placeholderTextColor="#999"
          />
        </View>
  
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Bank Account:</Text>
          <TextInput
            style={styles.input}
            value={user.bankAccount}
            onChangeText={handleBankAccountChange}
            placeholder="Enter your bank account number"
            placeholderTextColor="#999"
          />
        </View>
  
        <View style={styles.headerContainer}>
          <Pressable onPress={pickImage}>
            <Image
                source={profile.avatar_url && !isImageLoading ? { uri: profile.avatar_url } : defaultProfilePic}
                style={styles.profileImage}
                onLoadEnd={() => setImageLoading(false)} // Set loading to false once image loads
                onError={() => setImageLoading(false)}  // Handle potential errors by stopping loading
            />
          </Pressable>
          <Text style={styles.pfpheading}>Profile picture:</Text>
        </View>
  
        <Pressable
          style={[
            styles.saveButton,
            {
              backgroundColor: isEdited ? '#4CAF50' : '#ccc',
            },
          ]}
          onPress={handleSaveDetails}
          disabled={!isEdited}
        >
          <Text style={styles.buttonText}>Save Details</Text>
        </Pressable>
      </View>
      <View style={{flex: 1}}/>
      <Pressable onPress={handleLogout}>
        <Text style={styles.logoutText}>Log out</Text>
      </Pressable>
    </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: '#fff',
    },
    container2: {
      borderRadius: 15,
      
      
      marginBottom: 20, // Add margin below the container
    },
    headerContainer: {
      flexDirection: 'row-reverse', // Reverse the order of elements
      marginBottom: 20,
      
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    mainHeading: {
      fontSize: 24,
      fontWeight: '700',
      marginBottom: 20,
      color: '#333',
      textAlign: 'center',
      flex: 2,
    },
    pfpheading: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 5,
      color: '#333',
      textAlign: 'left',
      flex: 2,
    },
    inputContainer: {
      marginBottom: 15,
    },
    label: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 5,
    },
    input: {
      fontSize: 16,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: '#4CAF50',
      borderRadius: 15, // Rounded corners
      backgroundColor: '#D4F0DD',
      color: '#333',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    profileImage: {
      width: 150,
      height: 150,
      borderRadius: 75,
      marginRight: 15,
      resizeMode: 'cover',
      overflow: 'hidden',
      borderColor: '#4CAF50',
      borderWidth: 2, // Adds a border similar to user group tags
    },
    evenmatelogo: {
      width: 33,
      height: 27,
      marginRight: 0,
      resizeMode: 'cover',
      overflow: 'hidden',
    },
    saveButton: {
      marginTop: 10,
      paddingVertical: 15,
      borderRadius: 8,
      alignItems: 'center',
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    logoutText: {
      color: 'red',
      fontSize: 20,
      fontWeight: '600',
      textAlign: 'center',
      // i want it to be at the bottom of the screen
    },
    errorText: {
      color: 'red',
      fontSize: 16,
      textAlign: 'center',
    },
    debugImageContainer: {
      marginTop: 20,
      alignItems: 'center',
    },
    debugText: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    debugImage: {
      width: 150,
      height: 150,
      borderRadius: 75,
      borderColor: '#ccc',
      borderWidth: 1,
      resizeMode: 'cover',
    },
  });

export default AccountSettings;