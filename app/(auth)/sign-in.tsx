// app/(auth)/sign-in.tsx 
import { View, Text, TextInput, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useState } from 'react';
import Button from '../../components/Button';
import { Link, Stack } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { styles } from '@/constants/styles';

const SignInScreen = () => {
  // State variables
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Sign in with email and password
  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) Alert.alert(error.message);
    setLoading(false);
  }
  
  return (
    // Dismiss keyboard when tapping outside of input fields
    <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); }} accessible={false}>
      <View style={styles.container2}>
        <Stack.Screen options={{ title: 'Sign in' }} />
        <Text style={styles.title}>Sign in to Evenmate</Text>

        {/* Email input */}
        <Text style={styles.label2}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="jon@gmail.com"
          style={styles.input}
        />

        {/* Password input */}
        <Text style={styles.label2}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder=""
          style={styles.input}
          secureTextEntry
        />

        {/* Sign in button */}
        <Button onPress={signInWithEmail} disabled={loading} text="Sign in" />
        
        {/* Bottom text */}
        <View style={styles.bottomContainer}>
          <Text style={styles.textnormal}>New to Evenmate?</Text>
          <Link href="/sign-up" style={styles.textButton}>
            Create an account
          </Link>
        </View>
        <View style={styles.spacer} />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default SignInScreen;