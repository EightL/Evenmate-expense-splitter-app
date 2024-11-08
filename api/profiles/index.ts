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
  };
  
  export const useUpdateProfile = async ({ id, username, bankAccount }: UpdateUserProfileParams): Promise<void> => {
    const { error } = await supabase
      .from('profiles')
      .update({
        username: username,
        bank_account: bankAccount,
      })
      .eq('id', id);
  
    if (error) {
      throw new Error(`Error updating profile: ${error.message}`);
    }
  };