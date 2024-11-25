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
  if (!user || !user.id) {
    console.error('Invalid user data for save operation');
    return;
  }

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

  try {
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching user for stats update:', fetchError);
      return;
    }

    if (!user) {
      console.error('User not found for stats update:', userId);
      return;
    }

    const updates = type === 'search' 
      ? { totalSearches: (user.totalSearches || 0) + 1 }
      : { savedSearches: (user.savedSearches || 0) + 1 };

    const { error: updateError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating user stats:', updateError);
      throw updateError;
    }
  } catch (error) {
    console.error('Error in updateUserStats:', error);
  }
};

export const updateUserLastLogin = async (userId: string): Promise<void> => {
  console.log('Updating last login for user:', userId);
  if (!userId) {
    console.error('No user ID provided for last login update');
    return;
  }

  try {
    const { error } = await supabase
      .from('users')
      .update({ lastLogin: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      console.error('Error updating last login:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in updateUserLastLogin:', error);
  }
};

export const changeUserPassword = async (userId: string, newPassword: string): Promise<void> => {
  console.log('Changing password for user:', userId);
  if (!userId) {
    console.error('No user ID provided for password change');
    return;
  }

  try {
    const { error } = await supabase
      .from('users')
      .update({ password: newPassword })
      .eq('id', userId);

    if (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in changeUserPassword:', error);
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  console.log('Getting current user');
  try {
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      console.log('No stored user found');
      return null;
    }

    const user = JSON.parse(storedUser);
    if (!user || !user.id) {
      console.log('Invalid stored user data');
      return null;
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching current user:', error);
      return null;
    }

    if (!data) {
      console.log('User not found in database');
      localStorage.removeItem('currentUser');
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
};