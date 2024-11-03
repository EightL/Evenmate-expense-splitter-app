// api/mates/index.ts
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';


export const useGroupsList = () => {
    return useQuery({
        queryKey: ['groupslist'],
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
                groupid,
                groups!groupid(*)
            `)
                .or(`userid.eq.${currentUserId}`);

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

      console.log("Returned data:", membersWithBalances);

      return membersWithBalances;
    },
  });
};



// Returns All the group members including CurrentUser
// export const useGroupMembers = (currentGroupId : string) => {
//     return useQuery({
//         queryKey: ['groupMembers', currentGroupId],
//         queryFn: async () => {
        
//             const { data, error } = await supabase
//             .from('rel_ingroup')
//             .select(`
//                 userid,
//                 profiles!userid(*)
//             `)
//             .eq('groupid', currentGroupId)
//             if(error) {
//                 throw new Error(error.message);
//             }
//             return data;
//         },
//     });
// }



export const useGroupInfo = () => {
    return useQuery({
        queryKey: ['groupsinfo'],
        queryFn: async () => {
            const { data, error } = await supabase
            .from('groups')
            .select('*');
            if(error) {
                throw new Error(error.message);
            }
            return data;
        },
    });
}
