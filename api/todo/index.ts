// /api/todo/index.ts
// ITU Project, "Evenmate"
// Author(s): Martin Ševčík, Jakub Lůčný
// VUT FIT 2024

import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

// Get list of all group ToDos
export const useTodoList = (groupId: string) => {
return useQuery({
    queryKey: ['groupTodoList', groupId],
    queryFn: async () => {
        const { data, error } = await supabase
        .from('todo')
        .select('*')
        .eq('in_group', groupId);

        if (error) {
            throw new Error(`Error retrieving Todo list: ${error.message}`);
        }
        return data;
    },
    enabled: !!groupId,
});
}

// Retrieve all info about specific ToDo
export const useTodoInfo = (todoId: string | null) => {
return useQuery({
    queryKey: ['todoInfo', todoId],
    queryFn: async () => {
        const { data, error } = await supabase
        .from('todo')
        .select('*')
        .eq('id', todoId)
        .single();

      if (error) {
        throw new Error(`Error retrieving Todo info: ${error.message}`);
    }
        return data;
    },
});
}

// Deletes specified Todo
export const deleteTodo = async (todoId: string) => {
    const { error } = await supabase
    .from('todo')
    .delete()
    .eq('id', todoId)

    if (error) {
        throw new Error(`Error deleting Todo: ${error.message}`);
    }

    return true;
}

// Creates new Todo with given name in given group
export const createTodo = async (todoName: string, groupId: string) => {
  const { data: newGroup, error } = await supabase
    .from('todo')
    .insert({
      name: todoName,
      created_at: new Date().toISOString(),
      description: null,
      in_group: groupId,
      done: false,
    })
    .select()
    .single();

  if (error) {
      throw new Error(`Error creating Todo: ${error.message}`);
  }

  return newGroup;
};

// Updates specified Todo
export const updateTodo = async (todoId: string, name: string, description: string) => {
  const { error } = await supabase
    .from('todo')
    .update({
      name: name,
      description: description,
  })
    .eq('id', todoId);

  if (error) {
    throw new Error(error.message || 'Failed to update todo');
  }
};

// Changes status of specified Todo
export const changeTodoStatus = async (todoId: string, done: boolean) => {
  const { error } = await supabase
    .from('todo')
    .update({
      done: done,
  })
    .eq('id', todoId);

  if (error) {
    throw new Error(error.message || 'Failed to update todo');
  }
};