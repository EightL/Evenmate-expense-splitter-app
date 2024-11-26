import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native';
  
  
// Sign up with email and password
export async function signUp(email, password, username) {
const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
    data: {
        username, // Include username in the sign-up data
    },
    },
});

    if (error) Alert.alert(error.message);
}
