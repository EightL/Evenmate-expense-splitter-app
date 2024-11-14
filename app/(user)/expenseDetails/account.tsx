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
} from 'react-native';
import { useUserInfo, useUpdateProfile } from '@/api/profiles';
import { supabase } from '@/lib/supabase';
import { useGroupsList } from '@/api/groups';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
//  import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import { useGetCurrentUserId } from '@/api/getCurrentUserId';
import QRCode from 'react-native-qrcode-svg';
import defaultProfilePic from '@/assets/images/defaultProfilePic.png';

type GroupItem = {
  id: string;
  name: string;
  notes: string;
};


const AccountScreen = () => {
  const router = useRouter();
  // const navigation = useNavigation(); // Initialize navigation
  const { data: currentUserId, error } = useGetCurrentUserId();

  // Fetch the current user's profile data
  const {
    data: profile,
    isLoading: isProfileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useUserInfo(currentUserId || null);

  // // Configure header with QR Code icon
  // useLayoutEffect(() => {
  //   if (profile?.email) {
  //     navigation.setOptions({
  //       headerRight: () => (
  //         <Pressable
  //           onPress={() => {
  //             // Navigate to the QR Code screen or perform any action
  //             router.push({
  //               pathname: '/friendDetails/inviteFriend',
  //               params: { email: profile.email },
  //             });
  //           }}
  //           style={{ marginRight: 15 }}
  //         >
  //           <Ionicons name="qr-code" size={24} color="#000" />
  //         </Pressable>
  //       ),
  //     });
  //   }
  // }, [navigation, router, profile?.email]);

  //

  // Fetch the user's groups
  const {
    data: groupsDataRaw,
    isLoading: isGroupsLoading,
    error: groupsError,
    refetch: refetchGroups,
  } = useGroupsList(currentUserId || null);

  // Map groupsData to match GroupItem type
  const groupsData: GroupItem[] | undefined = groupsDataRaw?.map(item => ({
    id: item.groups.id,
    name: item.groups.name,
    notes: item.groups.notes,
  }));

  // Local state to manage user input
  const [user, setUser] = useState({
    username: '',
    bankAccount: '',
    email: '',
  });

  // Reference to store the original user data for comparison
  const originalUserRef = useRef({
    username: '',
    bankAccount: '',
    email: '',
  });

  // Effect to set user data once the profile is fetched
  useEffect(() => {
    if (profile) {
      setUser({
        username: profile.username || '',
        bankAccount: profile.bank_account || '',
        email: profile.email || '',
      });
      originalUserRef.current = {
        username: profile.username || '',
        bankAccount: profile.bank_account || '',
        email: profile.email || '',
      };
    }
  }, [profile]);

  // Handlers for input changes
  const handleNameChange = (text: string) => {
    setUser((prev) => ({ ...prev, username: text }));
  };

  const handleBankAccountChange = (text: string) => {
    setUser((prev) => ({ ...prev, bankAccount: text }));
  };

  // Determine if any changes have been made
  const isEdited =
    user.username !== originalUserRef.current.username ||
    user.bankAccount !== originalUserRef.current.bankAccount;

  const handleSaveDetails = async () => {
    try {
      await useUpdateProfile({
        id: profile.id,
        username: user.username,
        bankAccount: user.bankAccount,
      });
  
      Alert.alert('Success', 'Your details have been updated.');
      originalUserRef.current = { ...user };
      refetchProfile();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
    
  };

  // Render each group item
  const renderGroupItem = (item: GroupItem ) => (
    <Pressable
      style={styles.groupBox}
      onPress={() =>
        router.push({
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

  // Render the header component containing account information and "Save Details" button
  const renderAccountHeader = () => (
    null
  );

  // Render the groups section header
  const renderGroupsHeader = () => (
    <Text style={styles.subHeading}>My Groups</Text>
  );

  // Combined List Header Component
  const listHeaderComponent = (
    <>
      {renderAccountHeader()}

      {/* Groups Loading Indicator */}
      {isGroupsLoading && (
        <View style={styles.groupsLoading}>
          <ActivityIndicator/>
          <Text style={styles.loadingText}>Loading groups...</Text>
        </View>
      )}

      {/* Groups Error Message */}
      {groupsError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Failed to load groups: {groupsError.message}
          </Text>
        </View>
      )}

      {/* Groups Header if groups are available */}
      {groupsData && groupsData.length > 0 && renderGroupsHeader()}
    </>
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


  const qrdata = user.email;
  return (
    <View style={styles.container}>
      {/* Profile Picture and Name */}
      <View style={styles.headerContainer}>
        <Image source={defaultProfilePic} style={styles.profileImage}></Image>
        <View style={styles.nameContainer}>
          <Text style={styles.nameText}>{user.username}</Text>
        </View>
      </View>

      {/* Bank Account */}
      <View style={styles.infoRow}>
        <Text style={styles.label}>Bank account:</Text>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>{user.bankAccount}</Text>
        </View>
      </View>

      {/* Email */}
      <View style={styles.infoRow}>
        <Text style={styles.label}>Email:</Text>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>{user.email}</Text>
        </View>
      </View>

      {/* Groups */}
      <Text style={styles.label}>Your Groups:</Text>
      {/* Render Groups */}
      <View style={styles.groupContainer}>
        {groupsData && groupsData.map(renderGroupItem)}
      </View>
      <Text style={styles.label}>QR Code:</Text>
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
            <Text style={styles.noQrText}>No QR data available</Text>
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
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
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
});

export default AccountScreen;