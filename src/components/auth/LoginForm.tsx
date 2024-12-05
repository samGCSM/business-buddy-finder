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
      
      // Demo credentials check
      if (email === 'admin@example.com' && password === 'admin') {
        // Create Supabase session for admin
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'admin@example.com',
          password: 'admin'
        });

        if (error) throw error;

        const adminUser = {
          id: '1',
          email: 'admin@example.com',
          type: 'admin' as const,
          password: 'admin',
          lastLogin: new Date().toISOString(),
          totalSearches: 0,
          savedSearches: 0
        };
        await setCurrentUser(adminUser);
        await updateUserLastLogin(adminUser.id);
        onLogin(true, 'admin');
        toast({
          title: "Success",
          description: "Logged in successfully as admin",
        });
        return;
      }
      
      if (email === 'user@example.com' && password === 'user') {
        // Create Supabase session for regular user
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'user@example.com',
          password: 'user'
        });

        if (error) throw error;

        const regularUser = {
          id: '2',
          email: 'user@example.com',
          type: 'user' as const,
          password: 'user',
          lastLogin: new Date().toISOString(),
          totalSearches: 0,
          savedSearches: 0
        };
        await setCurrentUser(regularUser);
        await updateUserLastLogin(regularUser.id);
        onLogin(true, 'user');
        toast({
          title: "Success",
          description: "Logged in successfully",
        });
        return;
      }

      toast({
        title: "Error",
        description: "Invalid credentials",
        variant: "destructive",
      });
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "An error occurred during login",
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