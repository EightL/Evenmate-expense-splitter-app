// /app/(user)/friendDetails/addNewMate.tsx
// ITU Project, "Evenmate"
// Author(s): Martin Ševčík
// VUT FIT 2024

import { useState, useEffect, useRef } from 'react';
import {View, Text, TextInput, StyleSheet, Pressable, Alert, ActivityIndicator, Modal, Image } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, Camera } from "expo-camera";
import { useGetCurrentUserId } from '@/api/getCurrentUserId';
import { getProfileByEmail, getExistingRelationship, createMateRelationship } from '@/api/mates';
import { useLayoutEffect } from 'react';
import evenmatelogo from '@/assets/images/Evenmatelogo_1.png';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from 'expo-router';

export default function AddNewMateScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScannerVisible, setScannerVisible] = useState(false);
  const [scanned, setScanned] = useState(false);
  const { data: currentUserId, error } = useGetCurrentUserId();
  const cameraRef = useRef<CameraView | null>(null);

  // Request camera permissions
  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);

  // Header options
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Image source={evenmatelogo} style={styles.evenmatelogo}></Image>
      ),
      // go back button
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

  // Function to handle adding a new mate
  const handleAddMate = async () => {
    // Input Validation
    if (!email.trim()) {
      return;
    }

    // Simple Email Format Validation
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }
    setLoading(true);

    // Add the mate
    try {
      // Check if the email already exists in profiles
      const existingProfile = await getProfileByEmail(email);

      if (existingProfile) {
        // Check if the relationship already exists to prevent duplicates
        const existingRelationship = await getExistingRelationship(currentUserId, existingProfile.id);
        console.log("EXISTINGGG",existingRelationship); // returns null ??
        if (existingRelationship) {
          Alert.alert('Info', 'You are already mates with this user.');
        }
        else {
          // Create a new mate relationship
          await createMateRelationship(existingProfile.id, currentUserId);
          // Update queries
          queryClient.invalidateQueries({ queryKey: ['mates', currentUserId] });
          queryClient.invalidateQueries({ queryKey: ['mates', existingProfile.id] });
        }
      }
      else {
        Alert.alert('Not Found', 'No user found with this email address.');
      }
      // Navigate back to the Mates screen after adding
      router.back();
    }
    catch (error: any) {
      console.error('Error adding mate:', error.message);
      Alert.alert('Error', error.message);
    }
    finally {
      setLoading(false);
    }
  };

  // Function to handle barcode scanning
  const handleBarcodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return; // Prevent multiple handles

    setScanned(true);
    setScannerVisible(false);
    setEmail(data.trim());
  };

  // Function to handle the scan button press
  const handleScanPress = () => {
    setScannerVisible(true);
    setScanned(false); // Allow scanning again
  };

  // Camera permission handling
  if (hasPermission === null) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  // No camera access
  if (hasPermission === false) {
    return (
      <View style={styles.centered}>
        <Text style={{ textAlign: 'center' }}>
          No access to camera. Please enable camera permissions in your device settings.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'New Contact' }} />
      <Text style={styles.title}>Add Mate</Text>

      {/* Email input */}
      <TextInput
        style={styles.input}
        placeholder="Email Address"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {/* Add Mate Button */}
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Pressable style={styles.button} onPress={() => handleAddMate()}>
          <Text style={styles.buttonText}>Add</Text>
        </Pressable>
      )}
  
      {/* Scan QR Code Button */}
      <Pressable style={styles.scanButton} onPress={() => handleScanPress()}>
        <Ionicons name="qr-code" size={24} color="#fff" />
        <Text style={styles.scanButtonText}>Scan QR Code</Text>
      </Pressable>

      {/* QR Code Scanner Modal */}
      <Modal visible={isScannerVisible} animationType="slide">
        <View style={styles.scannerContainer}>
          {/* Camera View */}
          <CameraView
            style={StyleSheet.absoluteFillObject}
            onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr", "pdf417"],
            }}
          />
          {/* Cancel Button */}
          <Pressable style={styles.cancelButton} onPress={() => setScannerVisible(false)}>
            <Text style={styles.buttonText}>Cancel</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    marginTop: 10,
    textAlign: 'center',
    color: '#333',
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
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scanButton: {
    flexDirection: 'row',
    backgroundColor: '#2196F3',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  evenmatelogo: {
    width: 33,
    height: 27,
    marginRight: 0,
    resizeMode: 'cover',
    overflow: 'hidden',
  },
  scannerContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    margin: 20,
  },
});