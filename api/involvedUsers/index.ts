// api/fetchExpenseDetails.ts
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

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

// Returns userIds of all involved people in the expense
export const useInvolvedPeople = (id: string) => {
  return useQuery({
    queryKey: ['involvedPeople', id],
    queryFn: async () => {
    // Fetch expense data
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

    // Fetch involved user IDs
    const userIds = relData.map((rel) => rel.userid);

    // Add the payer's ID if not already included
    if (expenseData && !userIds.includes(expenseData.paid_by)) {
      userIds.push(expenseData.paid_by);
    }

    // console.log("MATEIDS: ", userIds);

    return userIds;
  }});
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

// ALMOST CORRECTED VERSION, BUT BROKEN

// export const useExpenseDetails = (id: string) => {
//   return useQuery({
//     queryKey: ['expenseDetails', id],
//     queryFn: async () => {
//       // Fetch expense data
//       const { data: expenseData, error: expenseError } = await supabase
//         .from('Expenses')
//         .select('*')
//         .eq('id', id)
//         .single();

//       if (expenseError) throw new Error(expenseError.message);

//       // Fetch related users from Rel_owesFor
//       const { data: relData, error: relError } = await supabase
//         .from('Rel_owesFor')
//         .select('userid')
//         .eq('expenseid', id);

//       if (relError) throw new Error(relError.message);

//       // Fetch usernames of involved users
//       const userIds = relData.map((rel) => rel.userid);

//       // Add the payer's ID to the list if they are not already included
//       if (!userIds.includes(expenseData.paid_by)) {
//         userIds.push(expenseData.paid_by);
//       }

//       // Fetch user details (usernames) for involved users
//       const { data: users, error: usersError } = await supabase
//         .from('profiles') // Assuming you have a 'profiles' table
//         .select('username')
//         .in('id', userIds);

//       if (usersError) throw new Error(usersError.message);

//       // Calculate share per user
//       const share = expenseData.amount / users.length;
//       const splitDetails = users.map((user) => ({
//         username: user.username,
//         share,
//       }));

//       return { expenseData, splitDetails };
//     },
//     // Optionally: Add onError and onSuccess handlers
//   });
// };

export const fetchInvolvedUsers = async (id: string) => {
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
  
    return relData;
  }
  catch (error: any) {
    throw new Error(`Error fetching involved users: ${error.message}`);
  }
};