import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

export const useExpensesList = () => {
    return useQuery({
        queryKey: ['expenses'],
        queryFn: async () => {
            const { data, error } = await supabase
            .from('Expenses')
            .select('*');
            if(error) {
                throw new Error(error.message);
            }
            return data;
        },
    });
}

export const useMateExpenses = (currentUserId: string, mateId: string) => {
    return useQuery({
      queryKey: ['mateExpenses', currentUserId, mateId],
      queryFn: async () => {
        try {

            if (!currentUserId || !mateId) {
                throw new Error("currentUserId or mateId is undefined");
            }
  
          const { data: userExpenses, error: userError } = await supabase
            .from('Rel_owesFor')
            .select(`
              userid,
              expenseid,
              Expenses!expenseid(*)
            `)
            .or(`userid.eq.${currentUserId},userid.eq.${mateId}`);
  
          console.log("UserExpenses: ", userExpenses);
  
          if (userError) {
            throw new Error(userError.message);
          }
  
            //   console.log("KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKYYYYYYYYYYYYS");
  
          // Fetch expenses where paid_by is currentUserId or mateId
          const { data: paidByExpenses, error: paidByError } = await supabase
            .from('Expenses')
            .select('*')
            .or(`paid_by.eq.${currentUserId},paid_by.eq.${mateId}`);
  
          console.log("paidByExpenses: ", paidByExpenses);
  
          if (paidByError) {
            throw new Error(paidByError.message);
          }
  
          // Find intersection of the two results based on expenseid
          const userExpenseIds = new Set(userExpenses.map(exp => exp.expenseid));
          const intersection = paidByExpenses.filter(exp => userExpenseIds.has(exp.id));
  
          console.log("intersection: ", intersection);
          
          return intersection;
        } catch (error) {
          console.error("Error in useMateExpenses:", error);
          throw error;
        }
      },
    });
  };