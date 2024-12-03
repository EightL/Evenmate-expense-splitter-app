// /api/updateBalances/index.ts
// ITU Project, "Evenmate"
// Author(s): Martin Ševčík, Jakub Lůčný
// VUT FIT 2024

import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native';

type UpdateBalancesParams = {
  currentUserId: string;
  mateIds: string[];
  share: number;
};

// Updates balances for all specified mates
export const handleUpdateBalances = async ({
  currentUserId,
  mateIds,
  share,
}: UpdateBalancesParams) => {
  try {

    for (const mateId of mateIds) {
      if (mateId === currentUserId) {
        continue;
      }
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
        // Relationship exists, update each balance
        for (const balanceRecord of data) {
          if (balanceRecord.user1 === currentUserId && balanceRecord.user2 === mateId) {
            const newBalance = balanceRecord.balance + share;
            await supabase
              .from('rel_uubalance')
              .update({ balance: newBalance })
              .eq('id', balanceRecord.id);
          }
          else if (balanceRecord.user1 === mateId && balanceRecord.user2 === currentUserId) {
            const newBalance = balanceRecord.balance - share;
            await supabase
              .from('rel_uubalance')
              .update({ balance: newBalance })
              .eq('id', balanceRecord.id);
          }
        }
      }
      else {
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

  }
  catch (err: any) {
    Alert.alert('Error', err.message);
    throw err;
  }
};



