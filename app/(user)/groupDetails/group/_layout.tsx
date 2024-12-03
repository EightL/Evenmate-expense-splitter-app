// /app/(user)/groupDetails/group/_layout.tsx
// ITU Project, "Evenmate"
// Author(s): Jakub Lůčný
// VUT FIT 2024

import { Alert, StyleSheet } from 'react-native';
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

  return (
    <Stack>
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Groups',
          headerTitleAlign: 'center',
          headerLeft: () => (
            <TouchableOpacity
                onPress={() => router.back()}
                accessibilityLabel="Go Back"
                accessibilityRole="button"
            >
                <Ionicons
                name='arrow-back'
                size={30}
                color="#4CAF50" // green
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
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="groupNotes"
        options={{
          title: 'Group Notes',
          headerTitleAlign: 'center',
      }}/>
      <Stack.Screen
        name="groupOverview"
        options={{
          title: 'Group Overview',
          headerTitleAlign: 'center',
      }}/>
      <Stack.Screen
        name="groupSettings"
        options={{
          title: 'Group Settings',
          headerTitleAlign: 'center',
      }}/>
      <Stack.Screen
        name="getEvenMate"
        options={{
          title: 'Get Even',
          headerTitleAlign: 'center',
      }}/>
      <Stack.Screen
        name="groupTodo"
        options={{
          title: 'To-Do',
          headerTitleAlign: 'center',
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