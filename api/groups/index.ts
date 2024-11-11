// api/mates/index.ts
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';


// Retrieve all info of specific group
export const useGroupInfo = (groupId: string | null) => {
  return useQuery({
      queryKey: ['groupinfo', groupId],
      queryFn: async () => {

          const { data, error } = await supabase
          .from('groups')
          .select('*')
          .eq('id', groupId)
          .single();
          if(error) {
              throw new Error(error.message);
          }
          
          return data;
      },
  });
}

export const useGroupsList = (currentUserId: string | null) => {
    return useQuery({
        queryKey: ['groupslist', currentUserId],
        queryFn: async () => {

            // console.log("USERID in API function: ", currentUser);

            const { data, error } = await supabase
            .from('rel_ingroup')
            .select(`
                userid,
                groupid,
                groups!groupid(*)
            `)
            .eq('userid', currentUserId);

            if(error) {
                throw new Error(error.message);
            }
            return data;
        },
    });
}

export const useGroupMembers = (currentGroupId : string) => {
    return useQuery({
        queryKey: ['groupMembers', currentGroupId],
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
            .from('rel_ingroup')
            .select(`
                userid,
                profiles!userid(*)
            `)
            .eq('groupid', currentGroupId)
            .neq('userid', currentUserId)
            if(error) {
                throw new Error(error.message);
            }
            return data;
        },
    });
}


export const useGroupsTotalBalances = (groupIds: string[]) => {
  return useQuery<number[], Error>({
    queryKey: ['groupsTotalBalances', groupIds],
    queryFn: async () => {
      if (groupIds.length === 0) {
        return [];
      }

      // Retrieve the current user session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw new Error(sessionError.message);
      }

      const currentUserId = session?.user.id;

      if (!currentUserId) {
        throw new Error('User is not authenticated.');
      }

      /**
       * Fetches the total balance for a single group.
       *
       * @param groupId - The ID of the group.
       * @returns The total balance for the group.
       */
      const fetchGroupBalance = async (groupId: string): Promise<number> => {
        // Get group members excluding the current user
        const { data: groupMembers, error: groupError } = await supabase
          .from('rel_ingroup')
          .select('userid')
          .eq('groupid', groupId)
          .neq('userid', currentUserId);

        if (groupError) {
          throw new Error(groupError.message);
        }

        const userIds = groupMembers.map((member) => member.userid);

        if (userIds.length === 0) {
          return 0;
        }

        // Get balances between current user and each group member
        const { data: balances, error: balanceError } = await supabase
          .from('rel_uubalance')
          .select('balance')
          .eq('user1', currentUserId)
          .in('user2', userIds);

        if (balanceError) {
          throw new Error(balanceError.message);
        }

        // Calculate the total balance by summing individual balances
        const totalBalance = balances.reduce((sum, balance) => sum + (balance.balance || 0), 0);

        return totalBalance;
      };

      // Fetch balance for each group concurrently
      const balancePromises = groupIds.map((groupId) => fetchGroupBalance(groupId));

      try {
        // Await all balance fetches
        const balances = await Promise.all(balancePromises);
        return balances; // Returns an array like [100, 300, 400]
      } catch (error) {
        // Handle any errors that occurred during the balance fetches
        console.error('Error fetching group balances:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
  });
};




export const useGroupMembersWithBalance = (currentGroupId: string) => {
  return useQuery({
    queryKey: ['groupMembersWithBalance', currentGroupId],
    queryFn: async () => {
      // Retrieve the current user ID
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw new Error(sessionError.message);
      }

      const currentUserId = session?.user.id;

      // First query: Get group members excluding the current user
      const { data: groupMembers, error: groupError } = await supabase
        .from('rel_ingroup')
        .select(`
          userid,
          profiles!userid(*)
        `)
        .eq('groupid', currentGroupId)
        .neq('userid', currentUserId);

      if (groupError) {
        throw new Error(groupError.message);
      }

      // Extract userids from the group members
      const userIds = groupMembers.map((member) => member.userid);

      // Second query: Find balances between current user and each group member
      const { data: balances, error: balanceError } = await supabase
        .from('rel_uubalance')
        .select('*')
        .eq('user1', currentUserId)
        .in('user2', userIds);

      if (balanceError) {
        throw new Error(balanceError.message);
      }

      // Combine group members with their balances
      const membersWithBalances = groupMembers.map((member) => {
        const balanceInfo = balances.find((balance) => balance.user2 === member.userid);
        return {
          ...member,
          balance: balanceInfo?.balance || 0, // default balance to 0 if not found
        };
      });

      // console.log("Returned data:", membersWithBalances);

      return membersWithBalances;
    },
  });
};

export const fetchGroupNotes = async (groupId: string) => {
  const { data, error } = await supabase
    .from('groups')
    .select('notes')
    .eq('id', groupId)
    .single();

  if (error) {
    throw new Error(error.message || 'Failed to fetch notes.');
  }

  return data.notes || '';
};

export const updateGroupNotes = async (groupId: string, notes: string) => {
  const { error } = await supabase
    .from('groups')
    .update({ notes })
    .eq('id', groupId);

  if (error) {
    throw new Error(error.message || 'Failed to update notes.');
  }
};

export const createGroup = async (groupName: string, userId: string) => {
  const { data: newGroup, error: groupError } = await supabase
    .from('groups')
    .insert({
      name: groupName,
      creator_id: userId,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (groupError) {
    throw groupError;
  }

  return newGroup;
};

export const addUserToGroup = async (groupId: string, userId: string) => {
  const { error: membershipError } = await supabase
    .from('rel_ingroup')
    .insert({
      groupid: groupId,
      userid: userId,
      joined_at: new Date().toISOString(),
    });

  if (membershipError) {
    throw membershipError;
  }
};

export const checkUserMembership = async (userId: string, groupId: string) => {
  const { data, error } = await supabase
    .from('rel_ingroup')
    .select('*')
    .eq('userid', userId)
    .eq('groupid', groupId)
    .single();

  if (error && error.code === 'PGRST116') { // PGRST116: No rows found
    return null;
  }

  if (error) {
    throw error;
  }

  return data;
};

