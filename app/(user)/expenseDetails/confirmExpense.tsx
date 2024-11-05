import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router'; // Adjust based on your router setup
import { supabase } from '@/lib/supabase'; // Ensure supabase is correctly imported

export default function ConfirmExpenseScreen() {
    const router = useRouter();
    const { expenseName, cost, mateIds } = useLocalSearchParams();
    const totalCost = parseFloat(cost);
    const participantCount = mateIds.length + 1; // Including the current user
    const share = totalCost / participantCount;
  
    useEffect(() => {
      const handleUpdateBalances = async () => {
        // Get current user ID
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) {
          Alert.alert('Error', userError.message);
          return;
        }
        const currentUserId = user.id;
  
        try {
          // Update balances with each mate
          for (const mateId of mateIds) {
            // Fetch existing balance
            const { data, error } = await supabase
              .from('rel_uubalance')
              .select('*')
              .or(
                `and(user1.eq.${currentUserId},user2.eq.${mateId}),and(user1.eq.${mateId},user2.eq.${currentUserId})`
              )
              .single();
  
            if (error && error.code !== 'PGRST116') {
              throw error;
            }
  
            if (data) {
              // Relationship exists, update balance
              const newBalance =
                data.user1 === currentUserId
                  ? data.balance + share
                  : data.balance - share;
              await supabase
                .from('rel_uubalance')
                .update({ balance: newBalance })
                .eq('id', data.id);
            } else {
              // Relationship does not exist, create it
              await supabase.from('rel_uubalance').insert([
                {
                  user1: currentUserId,
                  user2: mateId,
                  balance: share,
                },
              ]);
            }
          }
  
          Alert.alert('Success', 'Expense added and balances updated.');
          router.replace('/'); // Navigate back to main screen
        } catch (err) {
          Alert.alert('Error', err.message);
        }
      };
  
      handleUpdateBalances();
    }, []);
}