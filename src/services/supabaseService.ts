import { createClient } from '@supabase/supabase-js';
import type { User } from '@/types/user';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export const getUsers = async (): Promise<User[]> => {
  console.log('Fetching all users');
  const { data, error } = await supabase
    .from('users')
    .select('*');
  
  if (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
  
  return data || [];
};

export const saveUser = async (user: User): Promise<void> => {
  console.log('Saving user:', user);
  const { error } = await supabase
    .from('users')
    .upsert(user);
  
  if (error) {
    console.error('Error saving user:', error);
    throw error;
  }
};

export const updateUserStats = async (userId: string, type: 'search' | 'savedSearch'): Promise<void> => {
  console.log('Updating stats for user:', userId, 'type:', type);
  if (!userId) {
    console.error('No user ID provided for stats update');
    return;
  }

  const { data: users, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (fetchError) {
    console.error('Error fetching user for stats update:', fetchError);
    throw fetchError;
  }

  const updates = type === 'search' 
    ? { totalSearches: (users.totalSearches || 0) + 1 }
    : { savedSearches: (users.savedSearches || 0) + 1 };

  const { error: updateError } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId);

  if (updateError) {
    console.error('Error updating user stats:', updateError);
    throw updateError;
  }
};

export const updateUserLastLogin = async (userId: string): Promise<void> => {
  console.log('Updating last login for user:', userId);
  if (!userId) {
    console.error('No user ID provided for last login update');
    return;
  }

  const { error } = await supabase
    .from('users')
    .update({ lastLogin: new Date().toISOString() })
    .eq('id', userId);

  if (error) {
    console.error('Error updating last login:', error);
    throw error;
  }
};

export const changeUserPassword = async (userId: string, newPassword: string): Promise<void> => {
  console.log('Changing password for user:', userId);
  if (!userId) {
    console.error('No user ID provided for password change');
    return;
  }

  const { error } = await supabase
    .from('users')
    .update({ password: newPassword })
    .eq('id', userId);

  if (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  console.log('Getting current user');
  const { data: sessionData } = await supabase.auth.getSession();
  
  if (!sessionData?.session) {
    console.log('No active session found');
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .single();

  if (error) {
    console.error('Error fetching current user:', error);
    return null;
  }

  return data;
};