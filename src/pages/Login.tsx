import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@supabase/auth-helpers-react";
import LoginForm from "@/components/auth/LoginForm";
import { getCurrentUser } from "@/services/userService";

const Login = () => {
  const navigate = useNavigate();
  const session = useSession();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Login - Checking authentication status");
        const currentUser = await getCurrentUser();
        console.log("Login - Current user check result:", currentUser);
        
        if (currentUser) {
          console.log("Login - User found, setting states");
          setIsLoggedIn(true);
          setIsAdmin(currentUser.type === 'admin');
          navigate('/');
        }
      } catch (error) {
        console.error("Login - Auth check error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [session, navigate]);

  const handleLogin = async (isLoggedIn: boolean, userType: 'admin' | 'user') => {
    console.log("Login - Login handler:", { isLoggedIn, userType });
    setIsLoggedIn(isLoggedIn);
    setIsAdmin(userType === 'admin');
    if (isLoggedIn) {
      console.log("Login - Successfully logged in, redirecting to home");
      navigate('/');
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // If already logged in, don't render the login form
  if (isLoggedIn) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <LoginForm onLogin={handleLogin} />
    </div>
  );
};

export default Login;