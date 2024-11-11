import React from 'react';
import { Pressable, Alert, StyleSheet } from 'react-native';
import { Stack, useLocalSearchParams, usePathname } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons'; // Ensure you've installed expo/vector-icons
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';

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
      pathname: '/groupDetails/group/inviteGroup',
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
          headerLeft: () => (
            <Pressable
              onPress={handleGoBack}
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.pressedButton,
              ]}
              accessibilityLabel="Go Back"
              accessibilityRole="button"
            >
              <FontAwesome
                name="arrow-left"
                size={25}
                color="#007AFF" // Blue color for back button
              />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable
              onPress={handleInviteToGroup}
              style={({ pressed }) => [
                styles.inviteButton,
                pressed && styles.pressedButton,
              ]}
              accessibilityLabel="Invite to Group"
              accessibilityRole="button"
            >
              <FontAwesome
                name="qrcode"
                size={25}
                color="#4CAF50" // Green color for invite
              />
            </Pressable>
          ),
        }}
      />
        <Stack.Screen
        name="expense"
        options={{
          headerShown: false,
        }}
      />
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
      name="inviteGroup"
      options={{
        title: 'Invite Group',
      }}/>
      <Stack.Screen
      name="account"
      options={{
        title: 'Account',
      }}/>
      {/* Other screens */}
    </Stack>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    marginLeft: 15,
  },
  inviteButton: {
    marginRight: 15,
  },
  pressedButton: {
    opacity: 0.7,
  },
  backButton: {
    marginLeft: 15, // Adds spacing from the left edge
    padding: 5, // Increases the touchable area
  },
});