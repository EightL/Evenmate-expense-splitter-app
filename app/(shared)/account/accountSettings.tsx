// /app/(shared)/account/accountSettings.tsx
// ITU Project, "Evenmate"
// Author(s): Martin Ševčík
// VUT FIT 2024

import 'react-native-get-random-values';
import { Buffer } from 'buffer';
global.Buffer = Buffer;
import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, Image, ActivityIndicator, Keyboard, TouchableWithoutFeedback, TouchableOpacity, } from 'react-native';
import { useUserInfo, useUpdateProfile } from '@/api/profiles';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useGetCurrentUserId } from '@/api/getCurrentUserId';
import * as ImagePicker from 'expo-image-picker';
import defaultProfilePic from '@/assets/images/defaultProfilePic.png';
import { uploadImageToStorage } from '@/api/profiles';
import { v4 as uuidv4 } from 'uuid'; // Import the UUID generator

const AccountSettings = () => {
  const router = useRouter();
  // State variables
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isImageLoading, setImageLoading] = useState(true);
  const { data: currentUserId, error } = useGetCurrentUserId();

  // Fetch the user's profile data
  const {
    data: profile,
    isLoading: isProfileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useUserInfo(currentUserId || null);

  // Initialize the user state
  const [user, setUser] = useState({
    username: '',
    bankAccount: '',
    email: '',
    avatar_url: '',
  });

  // Create a reference to the original user data
  const originalUserRef = useRef({
    username: '',
    bankAccount: '',
    email: '',
    avatar_url: '',
  });

  // Update the user state when the profile data changes
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

  // Handle changes to the user's name
  const handleNameChange = (text: string) => {
    setUser((prev) => ({ ...prev, username: text }));
  };

  // Handle changes to the user's bank account number
  const handleBankAccountChange = (text: string) => {
    setUser((prev) => ({ ...prev, bankAccount: text }));
  };

  // Handle the image picker
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

  // Check if the user has made any changes
  const isEdited =
    user.username !== originalUserRef.current.username ||
    user.bankAccount !== originalUserRef.current.bankAccount ||
    selectedImage !== null;


  // Upload the image to Supabase
  const uploadImage = async () => {
    if (!selectedImage) {
      Alert.alert("No Image Selected", "Please select an image first.");
      return null;
    }
  
    try {
      setLoading(true);  
      // Generate a unique file name
      const fileName = `avatars/${currentUserId}/profile_${uuidv4()}.jpg`;
  
      // Calls a backend function to upload the image
      const publicURL = await uploadImageToStorage(fileName, currentUserId, selectedImage);

      if (!publicURL) {
        throw new Error('Failed to retrieve public URL after upload.');
      }

      return publicURL;
    } catch (err: any) {
      console.error('Error uploading image:', err);
      Alert.alert('Error', err.message || 'An unknown error occurred.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Save the user's details
  const handleSaveDetails = async () => {
    try {
      setLoading(true);
  
      let imageUrl = user.avatar_url || profile.avatar_url;
  
      if (selectedImage) {        
        // Upload the image and get the URL
        const uploadedURL = await uploadImage();
        if (uploadedURL) {
          imageUrl = uploadedURL;
        } else {
          throw new Error('Failed to obtain uploaded image URL.');
        }
      }

      // Update the user's profile
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

  // Handle user logout
  const handleLogout = async () => {
    // const { error } = await supabase.auth.signOut();
    // if (error) {
    //   Alert.alert('Error', error.message);
    // }
    // else {
      router.replace('/(auth)/sign-in'); // Navigate to login screen
    // }
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
  
      {/* Name and bank account number */}
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

        {/* Profile Image */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={pickImage}>
            <Image
                source={profile.avatar_url && !isImageLoading ? { uri: profile.avatar_url } : defaultProfilePic}
                style={styles.profileImage}
                onLoadEnd={() => setImageLoading(false)} // Set loading to false once image loads
                onError={() => setImageLoading(false)}  // Handle potential errors by stopping loading
            />
          </TouchableOpacity>
          <Text style={styles.pfpheading}>Profile picture:</Text>
        </View>
  
        {/* Save button */}
        <TouchableOpacity
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
        </TouchableOpacity>
        </View>
        <View style={{flex: 1}}/>
          {/* Logout button */}
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>
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
      marginBottom: 20,
    },
    headerContainer: {
      flexDirection: 'row-reverse', 
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
      borderRadius: 15,
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
      borderWidth: 2,
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
      marginBottom: 20,
    },
    errorText: {
      color: 'red',
      fontSize: 16,
      textAlign: 'center',
    },
  });

export default AccountSettings;