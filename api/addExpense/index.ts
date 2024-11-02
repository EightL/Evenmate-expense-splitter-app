import { supabase } from '@/lib/supabase';
import { useMutation } from '@tanstack/react-query';

export const useAddExpense = () => {
  return useMutation({
    mutationFn: async ({ expenseName, numericCost, currentUserId }) => {
      const { data, error } = await supabase
        .from('Expenses')
        .insert([
          {
            name: expenseName,
            amount: numericCost,
            created_at: new Date().toISOString(), // Use the current date for created_at
            // description: description,
            paid_by: currentUserId,
          },
        ]);

      if (error) {
        throw new Error(error.message);
      }
      return data; // You can omit this return if you don't need it.
    },
  });
};
