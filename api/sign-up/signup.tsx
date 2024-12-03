// /api/sign-up/index.ts
// ITU Project, "Evenmate"
// Author(s): Martin Ševčík, Jakub Lůčný
// VUT FIT 2024

import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native';
  
  
// Sign up with email and password
export async function signUp(email, password, username) {
const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
    data: {
        username,
    },
    },
});

    if (error) Alert.alert(error.message);
}
