import { useEffect } from "react";
import { useUserState } from "./useUserState";
import { useDashboardMetrics } from "./useDashboardMetrics";
import { getCurrentUser } from "@/services/userService";

export const useMetrics = () => {
  const { userRole } = useUserState();
  const { metrics, fetchDashboardMetrics } = useDashboardMetrics();

  useEffect(() => {
    const initializePage = async () => {
      try {
        const currentUser = await getCurrentUser();
        
        if (!currentUser) {
          console.log('useMetrics - No user found');
          return;
        }

        await fetchDashboardMetrics(currentUser);
      } catch (error) {
        console.error('useMetrics - Error initializing:', error);
      }
    };

    initializePage();
  }, [fetchDashboardMetrics]);

  return { metrics, userRole };
};