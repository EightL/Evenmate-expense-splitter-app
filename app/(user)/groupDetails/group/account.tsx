// app/(user)/account.tsx

import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useUserInfo, useUpdateProfile } from '@/api/profiles';
import { supabase } from '@/lib/supabase';
import { useGroupsList } from '@/api/groups';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import { useGetCurrentUserId } from '@/api/getCurrentUserId';

type GroupItem = {
  id: string;
  name: string;
  notes: string;
};


const AccountScreen = () => {
  const router = useRouter();
  const navigation = useNavigation(); // Initialize navigation
  const { data: currentUserId, error } = useGetCurrentUserId();

  // Fetch the current user's profile data
  const {
    data: profile,
    isLoading: isProfileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useUserInfo(currentUserId || null);

  // Configure header with QR Code icon
  useLayoutEffect(() => {
    if (profile?.email) {
      navigation.setOptions({
        headerRight: () => (
          <Pressable
            onPress={() => {
              // Navigate to the QR Code screen or perform any action
              router.push({
                pathname: '/friendDetails/inviteFriend',
                params: { email: profile.email },
              });
            }}
            style={{ marginRight: 15 }}
          >
            <Ionicons name="qr-code" size={24} color="#000" />
          </Pressable>
        ),
      });
    }
  }, [navigation, router, profile?.email]);

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
  const renderGroupItem = ({ item }: { item: GroupItem }) => (
    <Pressable
      style={styles.groupItemContainer}
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
      <Text style={styles.groupName}>{item.name}</Text>
    </Pressable>
  );

  // Render the header component containing account information and "Save Details" button
  const renderAccountHeader = () => (
    <View style={styles.infoContainer}>
      <Text style={styles.mainHeading}>My Account</Text>

      {/* Name Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Name:</Text>
        <TextInput
          style={styles.input}
          value={user.username}
          onChangeText={handleNameChange}
          placeholder="Enter your name"
          placeholderTextColor="#999"
        />
      </View>

      {/* Bank Account Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Bank Account:</Text>
        <TextInput
          style={styles.input}
          value={user.bankAccount}
          onChangeText={handleBankAccountChange}
          placeholder="Enter your bank account number"
          keyboardType="numeric"
          placeholderTextColor="#999"
        />
      </View>

      {/* Email Display */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{user.email}</Text>
      </View>

      {/* Save Details Button */}
      <Pressable
        style={[
          styles.saveButton,
          { backgroundColor: isEdited ? '#4CAF50' : '#ccc' },
        ]}
        onPress={handleSaveDetails}
        disabled={!isEdited}
      >
        <Text style={styles.buttonText}>Save Details</Text>
      </Pressable>
    </View>
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

  return (
    <FlatList
      data={groupsData}
      keyExtractor={(item) => item.id}
      renderItem={renderGroupItem}
      ListHeaderComponent={listHeaderComponent}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContainer}
      ListEmptyComponent={
        !isGroupsLoading &&
        !groupsError && (
          <View style={styles.noGroupsContainer}>
            <Text style={styles.noGroupsText}>You are not part of any groups.</Text>
          </View>
        )
      }
      refreshing={isProfileLoading || isGroupsLoading}
      onRefresh={() => {
        refetchProfile();
        refetchGroups();
      }}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f2f2f2',
  },
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  mainHeading: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  subHeading: {
    fontSize: 20,
    fontWeight: '600',
    marginVertical: 15,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#4CAF50',
    fontWeight: '600',
  },
  input: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fafafa',
    color: '#333',
  },
  value: {
    fontSize: 16,
    color: '#555',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fafafa',
    borderRadius: 8,
  },
  saveButton: {
    marginTop: 10,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  groupItemContainer: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#e0f7e9',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  groupNotes: {
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#ffe6e6',
    borderRadius: 8,
  },
  groupsLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#4CAF50',
  },
  noGroupsContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  noGroupsText: {
    fontSize: 16,
    color: '#555',
  },
});

export default AccountScreen;