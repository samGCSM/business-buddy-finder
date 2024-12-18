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

// Additional code to fetch user from Supabase if not found in localStorage
export const fetchUserFromSupabase = async (email: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    console.error("Error fetching user from Supabase:", error);
    return null;
  }

  return data;
};
