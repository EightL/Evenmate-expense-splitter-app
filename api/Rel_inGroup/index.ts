// api/Rel_inGroup/index.ts
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

export const useSharedGroups = (currentUserId: string | undefined, mateId: string | string[]) => {
  return useQuery({
    queryKey: ['sharedGroups', currentUserId, mateId],
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


          // Fetch groups for `currentUserId`
          const { data: currentUserGroups, error: currentUserError } = await supabase
          .from('rel_ingroup')
          .select('groupid')
          .eq('userid', currentUserId);
          if (currentUserError) {
          throw new Error(currentUserError.message);
          }

          // Fetch groups for `mateId`
          const { data: mateGroups, error: mateError } = await supabase
          .from('rel_ingroup')
          .select('groupid')
          .eq('userid', mateId);
          if (mateError) {
          throw new Error(mateError.message);
          }

          // if (!currentUserGroups || !mateGroups) {
          // return [];
          // }

          // Find the intersection of both group lists
          const sharedGroupIds = currentUserGroups
          .map(group => group.groupid)
          .filter(groupid => mateGroups.some(mateGroup => mateGroup.groupid === groupid));

          // Fetch full details for shared groups
          const { data: sharedGroups, error: sharedGroupsError } = await supabase
          .from('groups')
          .select('*')
          .in('id', sharedGroupIds);
          if (sharedGroupsError) {
          throw new Error(sharedGroupsError.message);
          }

          return sharedGroups;
          },
        });
    }