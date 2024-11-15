// app/(user)/account.tsx

import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
  Modal,
} from 'react-native';
import { useUserInfo, useUpdateProfile } from '@/api/profiles';
import { supabase } from '@/lib/supabase';
import { useGroupsList } from '@/api/groups';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useGetCurrentUserId } from '@/api/getCurrentUserId';
import QRCode from 'react-native-qrcode-svg';
import defaultProfilePic from '@/assets/images/defaultProfilePic.png';
import * as Clipboard from 'expo-clipboard';

type GroupItem = {
  id: string;
  name: string;
  notes: string;
};

const copyToClipboard = async (text: string) => {
  await Clipboard.setStringAsync(text);
  Alert.alert('Copied to Clipboard');
};

const AccountScreen = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { data: currentUserId, error } = useGetCurrentUserId();
  const [isModalVisible, setModalVisible] = useState(false);
  const [isImageLoading, setImageLoading] = useState(true);

  const {
    data: profile,
    isLoading: isProfileLoading,
    error: profileError,
  } = useUserInfo(currentUserId || null);

  useLayoutEffect(() => {
    if (profile?.email) {
      navigation.setOptions({
        headerRight: () => (
          <Pressable
            onPress={() => {
              router.push({
                pathname: '/(user)/expenseDetails/accountSettings',
                params: { email: profile.email },
              });
            }}
            style={{ marginRight: 15 }}
          >
            <Ionicons name="settings" size={24} color="#000" />
          </Pressable>
        ),
      });
    }
  }, [navigation, router, profile?.email]);

  const {
    data: groupsDataRaw,
    isLoading: isGroupsLoading,
    error: groupsError,
  } = useGroupsList(currentUserId || null);

  const groupsData: GroupItem[] | undefined = groupsDataRaw?.map(item => ({
    id: item.groups.id,
    name: item.groups.name,
    notes: item.groups.notes,
  }));

  const displayQRinfo = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const renderGroupItem = (item: GroupItem) => (
    <Pressable
      key={item.id}
      style={styles.groupBox}
      onPress={() =>
        router.replace({
          pathname: `/(user)/groupDetails/group/${encodeURIComponent(item.id)}`,
          params: {
            name: item.name,
            notes: item.notes,
          },
        })
      }
    >
      <Text style={styles.groupText}>{item.name}</Text>
    </Pressable>
  );

  if (isProfileLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator/>
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
  
  const qrdata = profile.email;
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Image
            source={profile.avatar_url && !isImageLoading ? { uri: profile.avatar_url } : defaultProfilePic}
            style={styles.profileImage}
            onLoadEnd={() => setImageLoading(false)} // Set loading to false once image loads
            onError={() => setImageLoading(false)}  // Handle potential errors by stopping loading
          />
          <View style={styles.nameContainer}>
          <Text style={styles.nameText}>{profile.username}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Bank account:</Text>
        <Pressable style={styles.infoBox} onPress={() => copyToClipboard(profile.bank_account)}>
          <Text style={styles.infoText}>{profile.bank_account}</Text>
        </Pressable>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Email:</Text>
        <Pressable style={styles.infoBox} onPress={() => copyToClipboard(profile.email)}>
          <Text style={styles.infoText}>{profile.email}</Text>
        </Pressable>
      </View>

      <Text style={styles.label}>Your Groups:</Text>
      <View style={styles.groupContainer}>
        {groupsData && groupsData.map(renderGroupItem)}
      </View>
      <View style={styles.infoRowQR}>
        <Text style={styles.labelQrcode}>QR Code:</Text>
        <Pressable onPress={() => displayQRinfo()}>
          <Ionicons name="information-circle-outline" size={30} color="#000" />
        </Pressable>
      </View>
      {qrdata ? (
          <View style={styles.qrContainer}>
            <QRCode
              value={qrdata}
              size={Dimensions.get('window').width * 0.5}
              color="#4CAF50"
              backgroundColor="#ffffff"
            />
          </View>
        ) : (
          <View style={styles.qrContainer}>
            <Text>No QR data available</Text>
          </View>
        )}

      {/* Modal for QR Code Information */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>QR Code Information</Text>
            <Text style={styles.modalText}>
              This QR code contains your email address. It can be used to add you as a friend or group member.
            </Text>
            <Pressable style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  qrContainer: {
    marginVertical: 20,
    padding: 10,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    alignItems:'center',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 15,
    resizeMode: 'cover',
    overflow: 'hidden',
    flex : 1,
  },
  nameText:{
    fontSize: 30,
    fontWeight: 'bold',
  },
  nameContainer: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 15,
    borderColor: '#000',
    borderWidth: 2,
    flex : 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoRowQR: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  labelQrcode: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
    flex: 5,
  },
  labelCentered:{
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#D4F0DD',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  groupContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    marginBottom: 10,
  },
  groupBox: {
    backgroundColor: '#D4F0DD',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  groupText: {
    fontSize: 14,
    fontWeight : 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default AccountScreen;