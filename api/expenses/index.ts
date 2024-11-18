import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';


// Retrieve all info of specific expense
export const useExpenseInfo = (expenseId: string | null) => {
  return useQuery({
      queryKey: ['expenseinfo', expenseId],
      queryFn: async () => {
          const { data, error } = await supabase
          .from('Expenses')
          .select('*')
          .eq('id', expenseId)
          .single();
          if(error) {
              throw new Error(error.message);
          }
          
          return data;
      },
  });
}

export const deleteExpense = async (id: string) => {
  const { error: error2 } = await supabase
  .from('Rel_owesFor')
  .delete()
  .eq('expenseid', id)

  const { error } = await supabase
  .from('Expenses')
  .delete()
  .eq('id', id)
  .single();

  if (error || error2) {
    throw new Error(`Error deleting relationship: ${error.message}`);
  }

  return true;
}

export const updateExpense = async (id: string, expenseName: string, numericCost: number) => {
  try {
    const { error } = await supabase
      .from('Expenses')
      .update({
        name: expenseName,
        amount: numericCost,
      })
      .eq('id', id);

    if (error) {
      throw new Error('Error updating expense: ' + error.message);
    }

    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { success: false, message: error.message };
  }
};


export const useGroupExpensesList = (groupId: string) => {
  return useQuery({
      queryKey: ['groupExpenses', groupId],
      queryFn: async () => {
          const { data, error } = await supabase
          .from('Expenses')
          .select('*')
          .eq('in_group', groupId);
          if(error) {
              throw new Error(error.message);
          }
          // console.log("UseGroupExpense data:", data);
          return data;
      },
      enabled: !!groupId,
  });
}

export const useMateExpenses = (currentUserId: string, mateId: string) => {
    return useQuery({
      queryKey: ['mateExpenses', currentUserId, mateId],
      queryFn: async () => {
        try {

              // kinda sus, if anything is broken look here
            if (!currentUserId || !mateId) {
              return null;
            }
  
          const { data: userExpenses, error: userError } = await supabase
            .from('Rel_owesFor')
            .select(`
              userid,
              expenseid,
              Expenses!expenseid(*)
            `)
            .or(`userid.eq.${currentUserId},userid.eq.${mateId}`);
  
          // console.log("UserExpenses: ", userExpenses);
  
          if (userError) {
            throw new Error(userError.message);
          }
    
          // Fetch expenses where paid_by is currentUserId or mateId
          const { data: paidByExpenses, error: paidByError } = await supabase
            .from('Expenses')
            .select('*')
            .or(`paid_by.eq.${currentUserId},paid_by.eq.${mateId}`);
  
          // console.log("paidByExpenses: ", paidByExpenses);
  
          if (paidByError) {
            throw new Error(paidByError.message);
          }
  
          // Find intersection of the two results based on expenseid
          const userExpenseIds = new Set(userExpenses.map(exp => exp.expenseid));
          const intersection = paidByExpenses.filter(exp => userExpenseIds.has(exp.id));
  
          // console.log("intersection: ", intersection);
          
          return intersection;
        } catch (error) {
          console.error("Error in useMateExpenses:", error);
          throw error;
        }
      },
    });
  };

  type CreateExpenseParams = {
    expenseName: string;
    numericCost: number;
    currentUserId: string;
    groupId: string;
    participantCount: number;
    icon: string;
  };
  
  export const createExpense = async ({
    expenseName,
    numericCost,
    currentUserId,
    groupId,
    participantCount,
    icon,
  }: CreateExpenseParams): Promise<string> => {
    const { data, error } = await supabase
      .from('Expenses')
      .insert([
        {
          name: expenseName,
          amount: numericCost,
          created_at: new Date().toISOString(),
          paid_by: currentUserId,
          in_group: groupId || null,
          involved_people: participantCount,
          icon: icon,
        },
      ])
      .select()
      .single();
  
    if (error) {
      throw new Error(error.message);
    }
  
    return data.id;
  };
  
  export const insertRelOwesFor = async (expenseId: string, mateIds: string[]) => {
    const { error } = await supabase
      .from('Rel_owesFor')
      .insert(
        mateIds.map((mateId) => ({
          expenseid: expenseId,
          userid: mateId,
        }))
      );
  
    if (error) {
      throw new Error(error.message);
    }
  };