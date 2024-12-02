// /app/(user)/groupDetails/group/_layout.tsx
// ITU Project, "Evenmate"
// Author(s): Jakub Lůčný
// VUT FIT 2024

import React from 'react';
import { Pressable, Alert, StyleSheet } from 'react-native';
import { Stack, usePathname } from 'expo-router';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

export default function UserLayout() {
  const router = useRouter();
  const pathname = usePathname();

  const extractGroupId = (): string | null => {
    const pathSegments = pathname.split('/');
    const groupIdIndex = pathSegments.findIndex(segment => segment === 'groupDetails') + 2;
    return pathSegments[groupIdIndex] || null;
  };

  const groupId = extractGroupId();

  // Handle Invite to Group Navigation
  const handleInviteToGroup = () => {
    if (!groupId) {
      Alert.alert('Error', 'Group ID is missing.');
      return;
    }
    router.push({
      pathname: '/groupDetails/group/groupSettings',
      params: {
        groupId: groupId,
      },
    });
  };
  const handleGoBack = () => {
    router.back();
  };

  return (
    <Stack>
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Groups',
          headerTitleAlign: 'center', // Center the title
          headerLeft: () => (
            <TouchableOpacity
                onPress={() => router.back()}
                accessibilityLabel="Go Back"
                accessibilityRole="button"
            >
                <Ionicons
                name='arrow-back'
                size={30}
                color="#4CAF50" // Blue color
                />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={handleInviteToGroup}
              accessibilityLabel="Invite to Group"
              accessibilityRole="button"
            >
              <Ionicons name="settings" size={24} color="#000" />
            </TouchableOpacity>
          ),
        }}
      />
      {/* Other screens, some hidden headers, some just renamed */}
      <Stack.Screen
        name="getEvenGroup"
        options={{
          title: 'Get Even',
        }}
      />
      <Stack.Screen
        name="groupNotes"
        options={{
          title: 'Group Notes',
      }}/>
      <Stack.Screen
        name="groupOverview"
        options={{
          title: 'Group Overview',
      }}/>
      <Stack.Screen
        name="groupSettings"
        options={{
          title: 'Group Settings',
      }}/>
      <Stack.Screen
        name="getEvenMate"
        options={{
          title: 'Get Even',
      }}/>
      <Stack.Screen
        name="groupTodo"
        options={{
          title: 'To-Do',
      }}/>
      <Stack.Screen
        name="todoDetails"
        options={{
          headerShown: false,
      }}/>
    </Stack>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    marginLeft: 15,
  },
  inviteButton: {
    
  },
  backButton: {
    marginLeft: 15,
    padding: 5,
  },
});