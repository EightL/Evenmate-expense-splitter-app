// api/profiles/index.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Retrieve all info of specific user
export const useUserInfo = (userId: string | null) => {
    return useQuery({
        queryKey: ['userinfo', userId],
        queryFn: async () => {

            const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
            if(error) {
                throw new Error(error.message);
            }
            
            return data;
        },
    });
}


type UpdateUserProfileParams = {
    id: string;
    username: string;
    bankAccount: string;
    avatar_url: string;
  };
  
  export const useUpdateProfile = async ({ id, username, bankAccount, avatar_url }: UpdateUserProfileParams): Promise<void> => {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        username: username,
        bank_account: bankAccount,
        avatar_url: avatar_url,
      })
      .eq('id', id);
      
      console.log("avatar_url", avatar_url);
    if (error) {
      throw new Error(`Error updating profile: ${error.message}`);
    }
    console.log("dataAAAAAAAA", data);
  };