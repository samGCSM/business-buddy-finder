import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";
import { getCurrentUser } from "@/services/userService";

const Login = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getCurrentUser();
      console.log("Login - Current user from localStorage:", currentUser);
      
      if (currentUser) {
        console.log("Login - User found, redirecting to home");
        setIsLoggedIn(true);
        setIsAdmin(currentUser.type === 'admin');
        navigate('/');
      }
    };
    
    checkAuth();
  }, [navigate]);

  const handleLogin = async (isLoggedIn: boolean, userType: 'admin' | 'user') => {
    console.log("Login - Login handler:", { isLoggedIn, userType });
    setIsLoggedIn(isLoggedIn);
    setIsAdmin(userType === 'admin');
    if (isLoggedIn) {
      console.log("Login - Successfully logged in, redirecting to home");
      navigate('/');
    }
  };

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