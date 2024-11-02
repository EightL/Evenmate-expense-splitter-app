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
