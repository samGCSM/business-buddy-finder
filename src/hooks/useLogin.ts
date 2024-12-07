import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { updateUserLastLogin, setCurrentUser } from "@/services/userService";

export const useLogin = (onLogin: (isLoggedIn: boolean, userType: 'admin' | 'user') => void) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      console.log('Attempting login with email:', email);
      
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

      await updateUserLastLogin(user.id.toString());
      await setCurrentUser(user);
      
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
    } finally {
      setIsLoading(false);
    }
  };

  return { handleLogin, isLoading };
};