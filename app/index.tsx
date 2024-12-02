// /app/index.tsx
// ITU Project, "Evenmate"
// Author(s): Jakub Lůčný, Martin Ševčík
// VUT FIT 2024

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
        return <Redirect href={'/sign-up'} />
    }
};

export default index;