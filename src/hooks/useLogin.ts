import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useLogin = (onLogin: (isLoggedIn: boolean, userType: 'admin' | 'user') => void) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      console.log('Attempting login with email:', email);
      
      // First authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        console.error('Supabase Auth error:', authError);
        throw authError;
      }

      console.log('Successfully authenticated with Supabase Auth');

      // Then get user data from users table
      const { data: userRecord, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (userError) {
        console.error('Error fetching user from users table:', userError);
        throw userError;
      }

      if (!userRecord) {
        console.error('User not found in users table');
        throw new Error('User not found');
      }

      console.log('Found user in users table:', userRecord);

      // Store user data in localStorage
      localStorage.setItem('currentUser', JSON.stringify(userRecord));
      
      // Handle user type
      const userType = userRecord.type === 'admin' ? 'admin' : 'user';
      onLogin(true, userType);
      
      // Update the lastLogin timestamp
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          lastLogin: new Date().toISOString()
        })
        .eq('id', userRecord.id);

      if (updateError) {
        console.error('Error updating last login:', updateError);
      }

      toast({
        title: "Success",
        description: `Logged in successfully${userType === 'admin' ? ' as admin' : ''}`,
      });
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "Invalid credentials",
        variant: "destructive",
      });
      onLogin(false, 'user'); // Reset login state on error
    } finally {
      setIsLoading(false);
    }
  };

  return { handleLogin, isLoading };
};