// app/(user)/groupDetails/joinGroup.tsx

import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  StyleSheet,
  View,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
// import { BarCodeScanner } from 'expo-barcode-scanner';
import * as Clipboard from 'expo-clipboard';
import { useQueryClient, InvalidateQueryFilters  } from '@tanstack/react-query';
import { useGetCurrentUserId } from '@/api/getCurrentUserId';
import { checkUserMembership, addUserToGroup } from '@/api/groups';
import { Ionicons } from '@expo/vector-icons';

const JoinGroup = () => {
  const router = useRouter();
  const [groupId, setGroupId] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScannerVisible, setScannerVisible] = useState(false);
  const [scanned, setScanned] = useState(false); // New state
  const { data: currentUserId, error: currentUserError } = useGetCurrentUserId();


  const queryClient = useQueryClient();

  // useEffect(() => {
  //   (async () => {
  //     const { status } = await BarCodeScanner.requestPermissionsAsync();
  //     setHasPermission(status === 'granted');
  //   })();
  // }, []);

  const handleJoinGroup = async (enteredGroupId?: string) => {
    const finalGroupId = enteredGroupId ?? groupId;

    if (!finalGroupId.trim()) {
      Alert.alert('Validation Error', 'Please enter a Group ID.');
      return;
    }

    setLoading(true);
    try {
      // Check existing membership
      const existingMembership = await checkUserMembership(currentUserId, finalGroupId);

      if (existingMembership) {
        Alert.alert('Already a Member', 'You are already a member of this group.');
        return;
      }

      else {
        // Join group
        await addUserToGroup(finalGroupId.trim(), currentUserId);

        queryClient.invalidateQueries({ queryKey: ['groupslist', currentUserId] });
      }

      router.back(); // Navigate back to the previous screen
    } catch (error: any) {
      console.error('Error joining group:', error.message);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBarCodeScanned = ({ data }: { type: string; data: string }) => {
    if (scanned) return; // Prevent multiple handles

    setScanned(true);
    setScannerVisible(false);
    setGroupId(data);
    Alert.alert('Group ID Scanned', `Group ID: ${data}`, [
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
        <Pressable style={styles.button} onPress={() => handleJoinGroup()}>
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
          {/* <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          /> */}
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

export default JoinGroup;