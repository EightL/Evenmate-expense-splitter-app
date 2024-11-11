// app/(user)/friendDetails/addNewMate.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Ionicons } from '@expo/vector-icons';
import { useGetCurrentUserId } from '@/api/getCurrentUserId';
import { getProfileByEmail, getExistingRelationship, createMateRelationship } from '@/api/mates';

export default function AddNewMateScreen() {
  const router = useRouter();
  const queryClient = useQueryClient(); // Initialize the query client

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // QR Scanner States
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScannerVisible, setScannerVisible] = useState(false);
  const [scanned, setScanned] = useState(false);
  const { data: currentUserId, error } = useGetCurrentUserId();

  useEffect(() => {
    // Request Camera Permissions
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleAddMate = async () => {
    

    // Input Validation
    if (!email.trim()) {
      Alert.alert('Validation Error', 'Please enter an email address. GRRRRRRRRRRRRRRRRRRRRRRRRRRR');
      return;
    }

    // Simple Email Format Validation
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      if (!currentUserId) {
        throw new Error('User is not authenticated.');
      }

      // Check if the email already exists in profiles
      const existingProfile = await getProfileByEmail(email);


      if (existingProfile) {
        // Check if the relationship already exists to prevent duplicates
        const existingRelationship = await getExistingRelationship(currentUserId, existingProfile.id);

        if (existingRelationship) {
          Alert.alert('Info', 'You are already mates with this user.');
        } else {
          // Create a new mate relationship
          await createMateRelationship(existingProfile.id, currentUserId);
          // Update queries
          queryClient.invalidateQueries({ queryKey: ['mates', currentUserId] });
          queryClient.invalidateQueries({ queryKey: ['mates', existingProfile.id] });
          Alert.alert('Success', 'Mate added successfully.');
        }
      }
      // Navigate back to the Mates screen after adding
      router.back();
    } catch (error: any) {
      console.error('Error adding mate:', error.message);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBarCodeScanned = ({ data }: { type: string; data: string }) => {
    if (scanned) return; // Prevent multiple handles

    setScanned(true);
    setScannerVisible(false);
    setEmail(data.trim()); // Assuming the QR code contains the mate's email

    Alert.alert('Mate Scanned', `Email: ${data.trim()}`, [
      { text: 'Add Mate', onPress: () => handleAddMate() },
      { text: 'Cancel', style: 'cancel', onPress: () => setScanned(false) },
    ]);
  };

  const handleScanPress = () => {
    setScannerVisible(true);
    setScanned(false); // Allow scanning again
  };

  if (hasPermission === null) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

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
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: 'New Contact' }} />
      <Text style={styles.title}>Add Mate</Text>

      <TextInput
        style={styles.input}
        placeholder="Email Address"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : (
        <Pressable style={styles.button} onPress={handleAddMate}>
          <Text style={styles.buttonText}>Add</Text>
        </Pressable>
      )}

      <Pressable style={styles.scanButton} onPress={handleScanPress}>
        <Ionicons name="qr-code" size={24} color="#fff" />
        <Text style={styles.scanButtonText}>Scan QR Code</Text>
      </Pressable>

      {/* QR Code Scanner Modal */}
      <Modal visible={isScannerVisible} animationType="slide">
        <View style={styles.scannerContainer}>
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
          <Pressable style={styles.cancelButton} onPress={() => setScannerVisible(false)}>
            <Text style={styles.buttonText}>Cancel</Text>
          </Pressable>
        </View>
      </Modal>
    </ScrollView>
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