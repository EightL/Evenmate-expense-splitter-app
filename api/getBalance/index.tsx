import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

// Retrieve balance between specified users
export const useGetBalance = (currentUserId, mateId) => {
    return useQuery({
        queryKey: ['uubalance', currentUserId, mateId],
        queryFn: async () => {
            const { data, error } = await supabase
            .from('rel_uubalance')
            .select('balance')
            .eq('user1', currentUserId)
            .eq('user2', mateId)
            .single();

            if(error) {
                throw new Error(error.message);
            }
            
            return data;
        },
    });
  }