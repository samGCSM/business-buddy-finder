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

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getCurrentUser();
      console.log("Login - Current user:", currentUser);
      if (currentUser) {
        setIsLoggedIn(true);
        setIsAdmin(currentUser.type === 'admin');
        navigate('/'); // Always redirect to home after login
      }
    };
    
    checkAuth();
  }, [session, navigate]);

  const handleLogin = async (isLoggedIn: boolean, userType: 'admin' | 'user') => {
    console.log("Login - Login handler:", { isLoggedIn, userType });
    setIsLoggedIn(isLoggedIn);
    setIsAdmin(userType === 'admin');
    navigate('/'); // Redirect to home after successful login
  };

  // If already logged in, redirect to home
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