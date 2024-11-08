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
        refetchOnMount: 'always', // Ensures query refetches on each mount
    });
}

export const getProfileByEmail = async (email: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email.trim())
      .single();
  
    if (error && error.code !== 'PGRST116') { // PGRST116: No rows found
      throw error;
    }
  
    return data;
};

  export const getExistingRelationship = async (userId: string, mateId: string) => {
    const { data, error } = await supabase
      .from('rel_uubalance')
      .select('*')
      .or(`user1.eq.${userId},user2.eq.${userId}`)
      .eq('user1', mateId)
      .or(`user2.eq.${mateId}`)
      .maybeSingle();
  
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
  
    return data;
};
  
export const createMateRelationship = async (mateId: string, userId: string) => {
    // Insert a new row into the mates relationship table
    const { error: error1 } = await supabase
      .from('rel_uubalance')
      .insert([
        {
          user1: userId,
          user2: mateId,
          balance: 0, // Initialize balance as needed
        },
      ]);
    if (error1) {
      throw error1;
    }
    // Insert a reciprocal relationship
    const { error } = await supabase
      .from('rel_uubalance')
      .insert([
        {
          user1: mateId,
          user2: userId,
          balance: 0, // Initialize balance as needed
        },
      ]);
    if (error) {
      throw error;
    }
};