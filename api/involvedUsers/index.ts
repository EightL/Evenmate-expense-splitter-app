// api/fetchExpenseDetails.ts
import { supabase } from '@/lib/supabase';

type Expense = {
  id: string;
  name: string;
  amount: number;
  paid_by: string;
  created_at: string;
};

type RelOwesFor = {
  userid: string;
  expenseid: string;
};

export const fetchExpenseDetails = async (id: string) => {
  try {
    // Fetch expense details
    const { data: expenseData, error: expenseError } = await supabase
      .from('Expenses')
      .select('*')
      .eq('id', id)
      .single();

    if (expenseError) throw expenseError;

    // Fetch related users from Rel_owesFor
    const { data: relData, error: relError } = await supabase
      .from('Rel_owesFor')
      .select('userid')
      .eq('expenseid', id);

    if (relError) throw relError;

    // Fetch usernames of involved users
    const userIds = relData.map((rel) => rel.userid);

    // Add the payer's ID to the list if they are not already included
    if (!userIds.includes(expenseData.paid_by)) {
      userIds.push(expenseData.paid_by);
    }

    const { data: users, error: usersError } = await supabase
      .from('profiles') // Assuming you have a 'profiles' table
      .select('username')
      .in('id', userIds);

    if (usersError) throw usersError;

    // Calculate share per user
    const share = expenseData.amount / users.length;
    const splitDetails = users.map((user) => ({
      username: user.username,
      share,
    }));

    return { expenseData, splitDetails };
  } catch (error: any) {
    throw new Error(`Error fetching expense details: ${error.message}`);
  }
};
