import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useLogin = (onLogin: (isLoggedIn: boolean, userType: 'admin' | 'user') => void) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      console.log('Attempting login with email:', email);
      
      // Sign in with Supabase Auth
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('Auth sign in error:', signInError);
        throw signInError;
      }

      // After successful auth, get the user type from users table
      const { data: users, error: queryError } = await supabase
        .from('users')
        .select('type, id')
        .eq('email', email)
        .single();

      if (queryError) {
        console.error('Error fetching user type:', queryError);
        throw queryError;
      }

      if (!users) {
        console.error('No user found with provided credentials');
        throw new Error('User not found');
      }

      console.log('Found user:', users);

      // Update the lastLogin timestamp
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          lastLogin: new Date().toISOString()
        })
        .eq('id', users.id);

      if (updateError) {
        console.error('Error updating last login:', updateError);
      }

      // Store user data in localStorage
      localStorage.setItem('currentUser', JSON.stringify(users));
      
      onLogin(true, users.type as 'admin' | 'user');
      
      toast({
        title: "Success",
        description: `Logged in successfully${users.type === 'admin' ? ' as admin' : ''}`,
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