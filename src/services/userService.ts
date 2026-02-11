import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/user";

export const getCurrentUser = async (): Promise<User | null> => {
  console.log("Getting current user from service");
  
  // First try to get from localStorage
  const storedUser = localStorage.getItem('currentUser');
  console.log("Getting current user from localStorage");
  
  if (storedUser) {
    return JSON.parse(storedUser);
  }
  
  return null;
};

export const getUsers = async (): Promise<User[]> => {
  console.log('Getting users from service');
  const { data, error } = await supabase
    .from('users')
    .select('id, email, type, full_name, lastLogin, totalSearches, savedSearches, supervisor_id, role, created_at');

  if (error) {
    console.error('Error fetching users:', error);
    throw error;
  }

  return data || [];
};

export const saveUsers = async (users: User[]) => {
  console.log('Saving users:', users);
  for (const user of users) {
    if (user && user.id) {
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          password: user.password,
          type: user.type,
          full_name: user.full_name,
          lastLogin: user.lastLogin,
          totalSearches: user.totalSearches,
          savedSearches: user.savedSearches
        });

      if (error) {
        console.error('Error saving user:', error);
        throw error;
      }
    }
  }
};

export const setCurrentUser = async (user: User | null) => {
  console.log('Setting current user:', user);
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  } else {
    localStorage.removeItem('currentUser');
  }
};

export const fetchUserFromSupabase = async (email: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, type, full_name, lastLogin, totalSearches, savedSearches, supervisor_id, role, created_at')
    .eq('email', email)
    .single();

  if (error) {
    console.error("Error fetching user from Supabase:", error);
    return null;
  }

  return data;
};