import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getUsers, updateUserLastLogin, setCurrentUser } from "@/services/userService";

const LoginForm = ({ onLogin }: { onLogin: (isLoggedIn: boolean, userType: 'admin' | 'user') => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log('Attempting login with email:', email);
      
      // Query the users table directly first to validate credentials
      const { data: users, error: queryError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

      if (queryError || !users) {
        console.error('Login query error:', queryError);
        throw new Error('Invalid credentials');
      }

      console.log('Found user:', users);

      // Create a session using Supabase auth with a stronger password
      const strongPassword = password + '_123456'; // Make password meet minimum requirements
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: strongPassword,
      });

      if (authError) {
        console.error('Auth error:', authError);
        // If user doesn't exist in auth system, sign them up
        if (authError.message.includes('Invalid login credentials')) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: email,
            password: strongPassword,
          });
          
          if (signUpError) {
            console.error('Sign up error:', signUpError);
            throw signUpError;
          }
        } else {
          throw authError;
        }
      }

      // Update user's last login
      await updateUserLastLogin(users.id);
      await setCurrentUser(users);
      
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold text-center mb-6">Business Buddy Finder</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </form>
      <p className="mt-4 text-sm text-gray-600 text-center">
        Demo credentials:<br />
        Admin: admin@example.com / admin<br />
        User: user@example.com / user
      </p>
    </div>
  );
};

export default LoginForm;