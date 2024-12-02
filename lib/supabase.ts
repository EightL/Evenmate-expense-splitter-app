// /lib/supabase.ts
// ITU Project, "Evenmate"
// Author(s): Jakub Lůčný, Martin Ševčík
// VUT FIT 2024

import 'react-native-url-polyfill/auto';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

const supabaseUrl = 'https://fcxvtpbbexwjimojbbcy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjeHZ0cGJiZXh3amltb2piYmN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAyMTA5NDYsImV4cCI6MjA0NTc4Njk0Nn0.qeyu1kP_iG_xm8ZDI7f7m6m4FVR7p8FWGjAK8Dl-Rrw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});