// app/(user)/friendDetails/_layout.tsx
import { Pressable, StyleSheet, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
// Import the Evenmate logo
import evenmatelogo from '@/assets/images/Evenmatelogo_1.png';

export default function ExpenseStack() {
  const router = useRouter(); // Initialize the router

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Account',
          headerTitleAlign: 'center', // Center the title
          headerRight: () => (
            <Pressable
              onPress={() => router.push('/expenseDetails/account/accountSettings')}
              style={({ pressed }) => [
                styles.accountButton,
                pressed && styles.pressedButton,
              ]}
              accessibilityLabel="Account"
              accessibilityRole="button"
            >
              <Ionicons
                name="settings"
                size={25}
                color="#000"
              />
            </Pressable>
          ),
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
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
                color="#007AFF"
              />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
      name="accountSettings"
      options={{
        title: 'Account Settings',
        headerRight: () => (
            <Image source={evenmatelogo} style={styles.evenmatelogo} />
          ),
        headerLeft: () => (
        <Pressable
            onPress={() => router.back()}
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
            color="#007AFF"
            />
        </Pressable>
        ),
      }}/>
    </Stack>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    marginLeft: 15,
    padding: 5,
  },
  accountButton: {
    marginRight: 15,
    padding: 5,
  },
  pressedButton: {
    opacity: 0.5, 
  },
  evenmatelogo: {
    width: 33,
    height: 27,
    marginRight: 0,
    resizeMode: 'cover',
    overflow: 'hidden',
  },
  backButton: {
    marginLeft: 15,
    padding: 5,
  },
});