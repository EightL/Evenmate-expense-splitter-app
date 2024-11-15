// api/getCurrentUserId.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Fetch the current user's ID
export const useGetCurrentUserId = () => {
  return useQuery({
    queryKey: ['currentUserId'],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        throw new Error('Error fetching session: ' + error.message);
      }

      const session = data?.session;

      if (!session || !session.user) {
        throw new Error('No user session found');
      }

      return session.user.id;
    },
    refetchOnMount: 'always', // Ensures query refetches on each mount
  });
};
