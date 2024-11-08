// lib/auth.ts
import { Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';

export const handleLogout = async (router: ReturnType<typeof useRouter>) => {
  Alert.alert(
    'Logout',
    'Are you sure you want to logout?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes',
        onPress: async () => {
          try {
            const { error } = await supabase.auth.signOut();
            if (error) {
              // Handle sign-out error
              Alert.alert('Error', error.message);
            } else {
              // Navigate to the sign-in screen
              router.push('/sign-in');
            }
          } catch (err) {
            // Handle unexpected errors
            Alert.alert('Error', 'Failed to logout. Please try again.');
          }
        },
      },
    ],
    { cancelable: true }
  );
};

export const handleAccount = (router: ReturnType<typeof useRouter>) => {
  // Navigate to the account screen
  router.push('/expenseDetails/account');
};