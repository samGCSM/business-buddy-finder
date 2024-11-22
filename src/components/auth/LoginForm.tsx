import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { getUsers, updateUserLastLogin, setCurrentUser } from "@/services/userService";

const LoginForm = ({ onLogin }: { onLogin: (isLoggedIn: boolean, userType: 'admin' | 'user') => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const users = await getUsers();
      const user = users.find(u => u.email === email && u.password === password);
      
      if (user) {
        await updateUserLastLogin(user.id);
        await setCurrentUser(user);
        onLogin(true, user.type);
        toast({
          title: "Success",
          description: `Logged in successfully${user.type === 'admin' ? ' as admin' : ''}`,
        });
      } else {
        toast({
          title: "Error",
          description: "Invalid credentials",
          variant: "destructive",
        });
      }
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