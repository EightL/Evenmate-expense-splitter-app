// app/(user)/inviteFriend.tsx

import React from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';

export default function InviteGroupScreen() {
  const { email } = useLocalSearchParams();

  const handleCopy = async () => {
    if (email) {
      await Clipboard.setStringAsync(email);
      Alert.alert('Copied!', 'Email has been copied to your clipboard.');
    } else {
      Alert.alert('Error', 'No email found to copy.');
    }
  };

  if (!email) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Email not found.</Text>
      </View>
    );
  }

  const qrData = email; // Customize as needed, e.g., `mailto:${email}`

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Invite via Email</Text>
      <Text style={styles.subtitle}>Scan this QR code to send an invitation:</Text>
      <View style={styles.qrContainer}>
        <QRCode
          value={qrData}
          size={Dimensions.get('window').width * 0.6}
          color="#4CAF50"
          backgroundColor="#ffffff"
        />
      </View>
      <Pressable onPress={handleCopy} style={styles.copyButton}>
        <Text style={styles.copyLabel}>Copy Email:</Text>
        <Text style={styles.copyText}>{email}</Text>
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
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 15,
    color: '#666',
    textAlign: 'center',
  },
  copyButton: {
    alignItems: 'center',
    marginTop: 10,
  },
  copyLabel: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 5,
  },
  copyText: {
    fontSize: 16,
    color: '#333',
    textDecorationLine: 'underline',
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center',
  },
});