// app/(auth)/sign-in.tsx 
import { View, Text, TextInput, StyleSheet, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import React, { useState } from 'react';
import Button from '../../components/Button';
import { Link, Stack } from 'expo-router';
import { supabase } from '@/lib/supabase';

const SignInScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  return (
    <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); }} accessible={false}>
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Sign in' }} />
        <Text style={styles.title}>Sign in to Evenmate</Text>
        
        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="jon@gmail.com"
          style={styles.input}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder=""
          style={styles.input}
          secureTextEntry
        />

        <Button onPress={signInWithEmail} disabled={loading} text="Sign in" />
        
        
        <View style={styles.bottomContainer}>
          <Text style={styles.textnormal}>New to Evenmate?</Text>
          <Link href="/sign-up" style={styles.textButton}>
            Create an account
          </Link>
        </View>
        <View style={styles.spacer} /> {/* Spacer to push the link to the bottom */}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: 'center',
    flex: 1,
    backgroundColor: '#fff',
  },
  label: {
    color: 'gray',
  },
  title: {
    color: 'black',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#5AC07C',
    padding: 10,
    marginTop: 5,
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  textButton: {
    fontWeight: 'bold',
    color: "#5AC07C",
    fontSize: 16,
    marginVertical: 10,
  },
  textnormal: {
    fontSize: 16,
    color: "#000",
    marginVertical: 10,
    marginRight: 5,
  },
  spacer: {
    flex: 1,
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20, // Optional: Add some margin at the bottom
  },
});

export default SignInScreen;