import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { useUserInfo, useUpdateProfile } from '@/api/profiles';
import { supabase } from '@/lib/supabase';
import { useGroupsList } from '@/api/groups';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGetCurrentUserId } from '@/api/getCurrentUserId';
import QRCode from 'react-native-qrcode-svg';
import defaultProfilePic from '@/assets/images/defaultProfilePic.png';
import * as Clipboard from 'expo-clipboard';
import { styles } from '@/constants/styles';

type GroupItem = {
  id: string;
  name: string;
  notes: string;
};

// Copy text to clipboard
const copyToClipboard = async (text: string) => {
  await Clipboard.setStringAsync(text);
  Alert.alert('Copied to Clipboard');
};

// Account screen component
export default function AccountScreen () {
  const router = useRouter();
  const [isModalVisible, setModalVisible] = useState(false);
  const [isImageLoading, setImageLoading] = useState(true);

  // Fetch current user ID
  const { data: currentUserId } = useGetCurrentUserId();

  // Fetch user profile data
  const {
    data: profile,
    isLoading: isProfileLoading,
    error: profileError,
  } = useUserInfo(currentUserId || null);

  // Fetch user groups data
  const {
    data: groupsDataRaw,
  } = useGroupsList(currentUserId || null);

  // Update user profile
  const groupsData: GroupItem[] | undefined = groupsDataRaw?.map(item => ({
    id: item.groups.id,
    name: item.groups.name,
    notes: item.groups.notes,
  }));

  // Display QR code information
  const displayQRinfo = () => {
    setModalVisible(true);
  };

  // Close modal
  const closeModal = () => {
    setModalVisible(false);
  };

  // Render group item
  const renderGroupItem = (item: GroupItem) => (
    <TouchableOpacity
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
    </TouchableOpacity>
  );

  if (isProfileLoading) {
    return (
      <View>
        <ActivityIndicator/>
      </View>
    );
  }

  if (profileError) {
    return (
      <View>
        <Text>Failed to load account details.</Text>
      </View>
    );
  }
  
  // QR code data
  const qrdata = profile.email;
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Image
            source={profile.avatar_url && !isImageLoading ? { uri: profile.avatar_url } : defaultProfilePic}
            style={styles.profileImage}
            onLoadEnd={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}
          />
          <View style={styles.nameContainer}>
          <Text style={styles.nameText}>{profile.username}</Text>
        </View>
      </View>

    
      {/* Bank account */}
      <View style={styles.infoRow}>
        <Text style={styles.label}>Bank account:</Text>
        <TouchableOpacity style={styles.infoBox} onPress={() => copyToClipboard(profile.bank_account)}>
          <Text style={styles.infoText}>{profile.bank_account}</Text>
        </TouchableOpacity>
      </View>

      {/* Email */}
      <View style={styles.infoRow}>
        <Text style={styles.label}>Email:</Text>
        <TouchableOpacity style={styles.infoBox} onPress={() => copyToClipboard(profile.email)}>
          <Text style={styles.infoText}>{profile.email}</Text>
        </TouchableOpacity>
      </View>

      {/* Your Groups */}
      <Text style={styles.label}>Your Groups:</Text>
      <View style={styles.groupContainer}>
        {groupsData && groupsData.map(renderGroupItem)}
      </View>
      <View style={styles.infoRowQR}>
        <Text style={styles.labelQrcode}>QR Code:</Text>
        <TouchableOpacity onPress={() => displayQRinfo()}>
          <Ionicons name="information-circle-outline" size={30} color="#000" />
        </TouchableOpacity>
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
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};