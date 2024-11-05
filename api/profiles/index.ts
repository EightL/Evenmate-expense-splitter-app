// api/profiles/index.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const useCurrentUserProfile = (currentUserId: string | null) => {
    return useQuery({
        queryKey: ['currentuserprofile', currentUserId],
        queryFn: async () => {
            // Retrieve the current user ID
            // const {
            //     data: { session },
            //     error: sessionError,
            // } = await supabase.auth.getSession();
            // if (sessionError) {
            //     throw new Error(sessionError.message);
            // }
            // const currentUserId = session?.user.id; // retrieve current user ID

            // if (!currentUserId) {
            //     throw new Error('User is not authenticated.');
            // }

            const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUserId)
            .single();

            if(error) {
                throw new Error(error.message);
            }

            // console.log("PROFILE DATA: ", data);

            return data;
        },
    });
};