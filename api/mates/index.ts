// /api/mates/index.ts
// ITU Project, "Evenmate"
// Author(s): Martin Ševčík, Jakub Lůčný
// VUT FIT 2024

import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

// Returns all mates and their balances with specified User
export const useMatesList = (currentUserId: string | null) => {
  return useQuery({
    queryKey: ['mates', currentUserId],
    queryFn: async () => {
      if (!currentUserId) {
        return [];
      }

      const { data, error } = await supabase
        .from('rel_uubalance')
        .select(`
          balance,
          user1,
          user2,
          profiles!user2(*)
        `)
        .or(`user1.eq.${currentUserId}`);

      if (error) {
        console.error("Error fetching mates:", error.message);
        throw new Error(error.message);
      }

      return data;
    },
    refetchOnMount: 'always', 
  });
};

// Returns all info about a user specified by his email
export const getProfileByEmail = async (email: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email.trim())
    .single();

  return data;
};

// Returns the relationship between two users, if it already exists
export const getExistingRelationship = async (userId: string, mateId: string) => {
  const { data, error } = await supabase
    .from('rel_uubalance')
    .select('*')
    .eq('user1', userId)
    .eq('user2', mateId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  if (data){
    return true;
  }
  else{
    return false;
  }
};

// Creates a new mate relationship
export const createMateRelationship = async (mateId: string, userId: string) => {
    // Insert a new row into the mates relationship table
    const { error } = await supabase
      .from('rel_uubalance')
      .insert([
        {
          user1: userId,
          user2: mateId,
          balance: 0, // Initialize default balances to 0
        },
      ]);
    if (error) {
      throw error;
    }
    // Insert the opposite relationship
    const { error: error2 } = await supabase
      .from('rel_uubalance')
      .insert([
        {
          user1: mateId,
          user2: userId,
          balance: 0,
        },
      ]);
    if (error2) {
      throw error2;
    }
};

// Deletes a mate relationship
export const deleteMateRelationship = async (mateId: string, userId: string) => {
  const { error } = await supabase
  .from('rel_uubalance')
  .delete()
  .or(`and(user1.eq.${userId},user2.eq.${mateId}),and(user1.eq.${mateId},user2.eq.${userId})`);

  if (error) {
    throw new Error(`Error deleting relationship: ${error.message}`);
  }

  return true;
}