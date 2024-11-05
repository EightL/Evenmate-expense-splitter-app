// api/expenses/updateBalances.ts
import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native';
import { useQuery, QueryClient } from '@tanstack/react-query';


type UpdateBalancesParams = {
  currentUserId: string;
  mateIds: string[];
  share: number;
};

export const handleUpdateBalances = async ({
  currentUserId,
  mateIds,
  share,
}: UpdateBalancesParams) => {
  try {
    for (const mateId of mateIds) {
      // Fetch existing balance
      const { data, error } = await supabase
        .from('rel_uubalance')
        .select('*')
        .or(
          `and(user1.eq.${currentUserId},user2.eq.${mateId}),and(user1.eq.${mateId},user2.eq.${currentUserId})`
        );

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data && data.length > 0) {
        // console.log('Updating balances');
        // Relationship exists, update each balance record
        for (const balanceRecord of data) {
          if (balanceRecord.user1 === currentUserId && balanceRecord.user2 === mateId) {
            const newBalance = balanceRecord.balance + share;
            await supabase
              .from('rel_uubalance')
              .update({ balance: newBalance })
              .eq('id', balanceRecord.id);
          } else if (balanceRecord.user1 === mateId && balanceRecord.user2 === currentUserId) {
            const newBalance = balanceRecord.balance - share;
            await supabase
              .from('rel_uubalance')
              .update({ balance: newBalance })
              .eq('id', balanceRecord.id);
          }
        }
      } else {
        // console.log('Creating new balance records');
        // No existing record, insert both pairs
        const { error: insertError } = await supabase
          .from('rel_uubalance')
          .insert([
            { user1: currentUserId, user2: mateId, balance: share },
            { user1: mateId, user2: currentUserId, balance: -share },
          ]);

        if (insertError) {
          throw new Error(insertError.message);
        }
      }
    }

    Alert.alert('Success', 'Balances updated successfully.');
  } catch (err: any) {
    Alert.alert('Error', err.message);
    throw err;
  }
};



