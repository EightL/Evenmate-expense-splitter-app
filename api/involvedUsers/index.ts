// /api/involvedUsers/index.ts
// ITU Project, "Evenmate"
// Author(s): Martin Ševčík, Jakub Lůčný
// VUT FIT 2024

import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

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

    return userIds;
  }});
};

// Returns the details of the expense and the share per user
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

// Returns the IDs of all involved users in the expense
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