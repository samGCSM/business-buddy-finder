import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useLogin = (onLogin: (isLoggedIn: boolean, userType: 'admin' | 'user') => void) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      console.log('Attempting login with email:', email);
      
      // First, check if user exists and get credentials
      const { data: users, error: queryError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password);

      if (queryError) {
        console.error('Login query error:', queryError);
        throw new Error('Invalid credentials');
      }

      if (!users || users.length === 0) {
        console.error('No user found with provided credentials');
        throw new Error('Invalid credentials');
      }

      const user = users[0];
      console.log('Found user:', user);

      // Update the lastLogin timestamp directly in the database
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          lastLogin: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating last login:', updateError);
        throw updateError;
      }

      // Get the updated user data
      const { data: updatedUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (updatedUser) {
        console.log('Updated user data:', updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
      
      onLogin(true, user.type as 'admin' | 'user');
      
      toast({
        title: "Success",
        description: `Logged in successfully${user.type === 'admin' ? ' as admin' : ''}`,
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