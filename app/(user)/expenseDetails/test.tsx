import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';
import { Buffer } from 'buffer';
import 'react-native-get-random-values';

// Set up Buffer globally
// @ts-ignore
global.Buffer = Buffer;

const Test = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert("Permission Denied", "Permission to access camera roll is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
    } else {
      Alert.alert("No Image Selected", "Please select an image to upload.");
    }
  };

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

  const uploadImage = async () => {
    if (!selectedImage) {
      Alert.alert("No Image Selected", "Please select an image first.");
      return;
    }

    try {
      setLoading(true);

      const uint8Array = await fetchBlob(selectedImage);
      if (uint8Array.length === 0) {
        throw new Error('Blob is empty.');
      }

      const fileName = `test/${uuidv4()}.jpg`;
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

      const { publicURL, error: urlError } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(data.path);

      if (urlError) {
        console.error('URL Error:', urlError);
        throw urlError;
      }

      setUploadedImageUrl(publicURL);
      Alert.alert('Success', 'Image uploaded successfully.');
    } catch (err: any) {
      console.error('Error uploading image:', err);
      Alert.alert('Error', err.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Test Image Upload</Text>
      <Pressable onPress={pickImage} style={styles.button}>
        <Text style={styles.buttonText}>Pick Image</Text>
      </Pressable>

      {selectedImage && (
        <View style={styles.imageContainer}>
          <Text style={styles.label}>Selected Image:</Text>
          <Image source={{ uri: selectedImage }} style={styles.image} />
        </View>
      )}

      <Pressable onPress={uploadImage} style={styles.button} disabled={loading}>
        <Text style={styles.buttonText}>Upload Image</Text>
      </Pressable>

      {loading && <ActivityIndicator size="large" color="#0000ff" />}

      {uploadedImageUrl && (
        <View style={styles.imageContainer}>
          <Text style={styles.label}>Uploaded Image URL:</Text>
          <Text style={styles.url}>{uploadedImageUrl}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderColor: '#ccc',
    borderWidth: 1,
    resizeMode: 'cover',
  },
  url: {
    marginTop: 10,
    color: '#0000ff',
    textAlign: 'center',
  },
});

export default Test;