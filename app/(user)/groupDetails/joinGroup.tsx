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
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as Clipboard from 'expo-clipboard';
import { useQueryClient, InvalidateQueryFilters  } from '@tanstack/react-query';
import { useGetCurrentUserId } from '@/api/getCurrentUserId';
import { checkUserMembership, addUserToGroup } from '@/api/groups';


const JoinGroup = () => {
  const router = useRouter();
  const [groupId, setGroupId] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScannerVisible, setScannerVisible] = useState(false);
  const [scanned, setScanned] = useState(false); // New state
  const { data: currentUserId, error: currentUserError } = useGetCurrentUserId();


  const queryClient = useQueryClient();

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Join Group</Text>

      <TextInput
        style={styles.input}
        placeholder="Group ID"
        value={groupId}
        onChangeText={setGroupId}
        keyboardType="default"
        autoCapitalize="none"
      />

      <Pressable style={styles.scanButton} onPress={handleScanPress}>
        <Text style={styles.buttonText}>Scan QR Code</Text>
      </Pressable>

      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : (
        <Pressable style={styles.button} onPress={() => handleJoinGroup()}>
          <Text style={styles.buttonText}>Join Group</Text>
        </Pressable>
      )}

      {/* QR Code Scanner Modal */}
      <Modal visible={isScannerVisible} animationType="slide">
        <View style={styles.scannerContainer}>
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned} // Conditionally set handler
            style={StyleSheet.absoluteFillObject}
          />
          <Pressable style={styles.cancelButton} onPress={() => setScannerVisible(false)}>
            <Text style={styles.buttonText}>Cancel</Text>
          </Pressable>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  scanButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
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