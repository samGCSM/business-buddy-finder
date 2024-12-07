import { createClient } from '@supabase/supabase-js';
import type { User } from '@/types/user';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export const getUsers = async (): Promise<User[]> => {
  console.log('Fetching users from Supabase');
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*');

    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
    
    return data.map(user => ({
      ...user,
      totalSearches: parseInt(user.totalSearches?.toString() || '0', 10),
      savedSearches: parseInt(user.savedSearches?.toString() || '0', 10)
    })) || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const saveUser = async (user: User): Promise<void> => {
  console.log('Saving user to Supabase:', user);
  try {
    const { error } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email,
        type: user.type,
        password: user.password,
        lastLogin: user.lastLogin,
        totalSearches: user.totalSearches,
        savedSearches: user.savedSearches
      });

    if (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error saving user:', error);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  console.log('Getting current user from localStorage');
  const storedUser = localStorage.getItem('currentUser');
  return storedUser ? JSON.parse(storedUser) : null;
};

export const updateUserStats = async (userId: string, type: 'search' | 'savedSearch'): Promise<void> => {
  console.log('Updating user stats in Supabase:', userId, type);
  try {
    // First get the current user stats
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('totalSearches, savedSearches')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching user stats:', fetchError);
      throw fetchError;
    }

    // Parse current values and increment
    const currentTotalSearches = parseInt(userData?.totalSearches?.toString() || '0', 10);
    const currentSavedSearches = parseInt(userData?.savedSearches?.toString() || '0', 10);

    const updates = type === 'search'
      ? { totalSearches: currentTotalSearches + 1 }
      : { savedSearches: currentSavedSearches + 1 };

    // Update the stats
    const { error: updateError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating user stats:', updateError);
      throw updateError;
    }

    // Update localStorage to keep it in sync
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (type === 'search') {
        user.totalSearches = currentTotalSearches + 1;
      } else {
        user.savedSearches = currentSavedSearches + 1;
      }
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
  } catch (error) {
    console.error('Error updating user stats:', error);
    throw error;
  }
};

export const updateUserLastLogin = async (userId: string): Promise<void> => {
  console.log('Updating user last login in Supabase:', userId);
  try {
    const lastLogin = new Date().toISOString();
    const { error } = await supabase
      .from('users')
      .update({ lastLogin })
      .eq('id', userId);

    if (error) {
      console.error('Error updating last login:', error);
      throw error;
    }

    // Update localStorage to keep it in sync
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      user.lastLogin = lastLogin;
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
  } catch (error) {
    console.error('Error updating last login:', error);
    throw error;
  }
};

export const changeUserPassword = async (userId: string, newPassword: string): Promise<void> => {
  console.log('Changing user password in Supabase:', userId);
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
    console.error('Error changing password:', error);
    throw error;
  }
};
