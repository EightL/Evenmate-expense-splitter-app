// app/index.tsx
import { View, Text, ActivityIndicator } from 'react-native';
import React from 'react';
import Button from '../components/Button';
import { Link, Redirect } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';

const index = () => {
  const {session, loading} = useAuth();

    if (loading){
        return <ActivityIndicator/>
    }

    if (session){
        return <Redirect href={'/(user)/friendDetails'}/>
    }

    if (!session){
        return <Redirect href={'/sign-in'} />
    }
};

export default index;