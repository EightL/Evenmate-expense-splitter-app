import React from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';


export default function InviteGroupScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();

  const handleCopy = async () => {
    await Clipboard.setStringAsync(groupId);
    Alert.alert('Copied!', 'Group ID has been copied to your clipboard.');
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
    <View style={styles.container}>
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
      <Pressable onPress={handleCopy}>
        <Text style={styles.groupIdLabel}>Copy group ID:</Text>
        <Text style={styles.groupId}>{groupId}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrContainer: {
    marginVertical: 20,
    padding: 10,
    borderWidth: 2,
    borderColor: '#4CAF50',
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
  groupIdLabel: {
    fontSize: 16,
    marginTop: 20,
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
  },
});