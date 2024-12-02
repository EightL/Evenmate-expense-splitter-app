// /app/(user)/groupDetails/joinGroup.tsx
// ITU Project, "Evenmate"
// Author(s): Jakub Lůčný
// VUT FIT 2024

import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  Text,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  StyleSheet,
  View,
  Modal,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { Camera, CameraView } from 'expo-camera';
import { useQueryClient, InvalidateQueryFilters  } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import evenmatelogo from '@/assets/images/Evenmatelogo_1.png';
import { useGetCurrentUserId } from '@/api/getCurrentUserId';
import { checkUserMembership, addUserToGroup } from '@/api/groups';


export default function JoinGroup() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const navigation = useNavigation();

  const { data: currentUserId, error: currentUserError } = useGetCurrentUserId();
  const [groupId, setGroupId] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScannerVisible, setScannerVisible] = useState(false);
  const [scanned, setScanned] = useState(false);

  // Header with go back button and app logo
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

  // Get camera permissions
  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);

  // Join entered group
  const handleJoinGroup = async (enteredGroupId: string) => {
    const finalGroupId = enteredGroupId ?? groupId;

    if (!finalGroupId.trim()) {
      Alert.alert('Validation Error', 'Please enter a Group ID.');
      return;
    }

    setLoading(true);
    try {
      // Check if user is already member of the group
      const existingMembership = await checkUserMembership(currentUserId, finalGroupId);

      if (existingMembership) {
        Alert.alert('Already a Member', 'You are already a member of this group.');
        return;
      }
      // Add user to the group
      else {
        await addUserToGroup(finalGroupId.trim(), currentUserId);

        queryClient.invalidateQueries({ queryKey: ['groupslist', currentUserId] });
      }
      router.back();

    }
    catch (error: any) {
      console.error('Error joining group:', error.message);
      Alert.alert('Error joining group, please check you entered correct group ID');
    }
    finally {
      setLoading(false);
    }
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return; // Prevent multiple handles

    setScanned(true);
    setScannerVisible(false);
    setGroupId(data);
    Alert.alert('Group ID Scanned', [
      { text: 'OK', onPress: () => handleJoinGroup(data) },
    ]);
  };

  const handleScanPress = () => {
    setScannerVisible(true);
    setScanned(false); // Allow scanning again
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>
          No access to camera. Please enable camera permissions in your device settings.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join Group</Text>

      <TextInput
        style={styles.input}
        placeholder="Group ID"
        value={groupId}
        onChangeText={setGroupId}
        keyboardType="default"
        autoCapitalize="none"
      />
      
      {loading ? (
        <ActivityIndicator/>
      ) : (
        <Pressable style={styles.button} onPress={() => handleJoinGroup(groupId)}>
          <Text style={styles.buttonText}>Add</Text>
        </Pressable>
      )}

      <Pressable style={styles.scanButton} onPress={() => handleScanPress()}>
        <Ionicons name="qr-code" size={24} color="#fff" />
        <Text style={styles.scanButtonText}>Scan QR Code</Text>
      </Pressable>

      {/* QR Code Scanner Modal */}
      <Modal visible={isScannerVisible} animationType="slide">
        <View style={styles.scannerContainer}>
          <CameraView
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr", "pdf417"]}}
            style={StyleSheet.absoluteFillObject}
          />
          <Pressable style={styles.cancelButton} onPress={() => setScannerVisible(false)}>
            <Text style={styles.buttonText}>Cancel</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
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
  evenmatelogo: {
    width: 33,
    height: 27,
    marginRight: 0,
    resizeMode: 'cover',
    overflow: 'hidden',
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
