import { useState, useEffect } from "react";
import { getCurrentUser } from "@/services/userService";

export const useUserState = () => {
  const [userRole, setUserRole] = useState<'admin' | 'supervisor' | 'user' | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        console.log('useUserState - Current user:', currentUser);
        
        if (!currentUser) {
          console.log('useUserState - No user found');
          return;
        }

        setUserRole(currentUser.type as 'admin' | 'supervisor' | 'user');
        setUserId(currentUser.id);
      } catch (error) {
        console.error('useUserState - Error initializing:', error);
      }
    };

    initializeUser();
  }, []);

  return { userRole, userId };
};