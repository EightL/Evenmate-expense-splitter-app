import React from 'react';
import { Pressable, Image} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { styles } from '@/constants/styles';
import evenmatelogo from '@/assets/images/Evenmatelogo_1.png';


export default function GroupsStack() {
  const router = useRouter();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Groups',
          headerTitleAlign: 'center',
          headerLeft: () => (
            <Image source={evenmatelogo} style={styles.evenmatelogo}></Image>
          ),
          headerRight: () => (
            <Pressable
              onPress={() => router.push('/groupDetails/account')}
              accessibilityLabel="Account"
              accessibilityRole="button"
              style={{marginRight: 5}}
            >
              <FontAwesome
                name="user"
                size={25}
                color="#000"
              />
            </Pressable>
          ),
        }}
      />

      <Stack.Screen
        name="group"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="account"
        options={{
          headerShown : false,
          title: 'Account',
        }}
      />
      <Stack.Screen
        name="createGroup"
        options={{
          title: 'Create Group',
        }}
      />
      <Stack.Screen
        name="joinGroup"
        options={{
          title: 'Join Group',
        }}
      />
    </Stack>
  );
}