// api/getCurrentUserId.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const useGetCurrentUserId = () => {
  return useQuery({
    queryKey: ['currentUserId'],
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        throw new Error('Error fetching session: ' + error.message);
      }

      if (!session || !session.user) {
        throw new Error('No user session found');
      }

      return session.user.id;
    },
  });
};
