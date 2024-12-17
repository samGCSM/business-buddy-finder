import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useLogin = (onLogin: (isLoggedIn: boolean, userType: 'admin' | 'user') => void) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      console.log('Attempting login with email:', email);
      
      // First attempt Supabase Auth signin
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('Auth sign in error:', signInError);
        throw signInError;
      }

      console.log('Successfully authenticated with Supabase Auth');

      // Then get user data from users table
      const { data: userRecord, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle(); // Use maybeSingle instead of single to avoid 406 error

      if (userError) {
        console.error('Error fetching user from users table:', userError);
        throw userError;
      }

      if (!userRecord) {
        console.error('User not found in users table');
        throw new Error('User not found in application database');
      }

      console.log('Found user in users table:', userRecord);

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

      // Store user data in localStorage
      localStorage.setItem('currentUser', JSON.stringify(userRecord));
      
      onLogin(true, userRecord.type as 'admin' | 'user');
      
      toast({
        title: "Success",
        description: `Logged in successfully${userRecord.type === 'admin' ? ' as admin' : ''}`,
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