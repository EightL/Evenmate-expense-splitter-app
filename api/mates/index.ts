// api/mates/index.ts
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
// import { useGetCurrentUserId } from '@/api/getCurrentUserId';

export const useMatesList = (currentUserId: string | null) => {
    return useQuery({
        queryKey: ['mates', currentUserId],
        queryFn: async () => {
            // Retrieve the current user ID
            const {
                data: { session },
                error: sessionError,
            } = await supabase.auth.getSession();
            if (sessionError) {
                throw new Error(sessionError.message);
            }
            const currentUserId = session?.user.id; // retrieve current user ID


            const { data, error } = await supabase
            .from('rel_uubalance')
            .select(`
                balance,
                user1,
                user2,
                profiles!user2(*)
              `)
              .or(`user1.eq.${currentUserId}`);
            if(error) {
                throw new Error(error.message);
            }

            
            return data;
        },
    });
}
