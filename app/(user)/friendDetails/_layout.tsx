// /app/(user)/friendDetails/_layout.tsx
// ITU Project, "Evenmate"
// Author(s): Martin Ševčík
// VUT FIT 2024

import { Pressable, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import evenmatelogo from '@/assets/images/Evenmatelogo_1.png'; // Import the Evenmate logo
import { styles } from '@/constants/styles';

export default function MatesStack() {
  const router = useRouter(); // Initialize the router

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Mates',
          headerTitleAlign: 'center', // Center the title
          headerLeft: () => (
            <Image source={evenmatelogo} style={styles.evenmatelogo}></Image>
          ),
          headerRight: () => (
            <Pressable
              onPress={() => router.push('/account')} // Navigate to the account screen
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
        name="getEvenMate"
        options={{
          title: 'Get Even',
        }}
      />
      <Stack.Screen
      name="[id]"
      options={{
        title: 'Mate',
      }}/>
    </Stack>
  );
}
