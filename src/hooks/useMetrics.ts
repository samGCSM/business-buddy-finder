import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUser } from "@/services/userService";
import { toast } from "@/hooks/use-toast";

interface DashboardMetrics {
  totalProspects: number;
  newProspects: number;
  emailsSent: number;
  callsMade: number;
}

export const useMetrics = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalProspects: 0,
    newProspects: 0,
    emailsSent: 0,
    callsMade: 0,
  });
  const [userRole, setUserRole] = useState<'admin' | 'supervisor' | 'user' | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const initializePage = async () => {
      try {
        const currentUser = await getCurrentUser();
        console.log('useMetrics - Current user:', currentUser);
        
        if (!currentUser) {
          console.log('useMetrics - No user found');
          return; // Simply return without showing error toast
        }

        setUserRole(currentUser.type as 'admin' | 'supervisor' | 'user');
        setUserId(currentUser.id);
        await fetchDashboardMetrics(currentUser);
      } catch (error) {
        console.error('useMetrics - Error initializing:', error);
        // Only show error toast if there's an actual error, not just missing user
        if (error instanceof Error && error.message !== 'No user found') {
          toast({
            title: "Error",
            description: "Failed to load dashboard metrics",
            variant: "destructive",
          });
        }
      }
    };

    initializePage();
  }, []);

  const fetchDashboardMetrics = async (currentUser: any) => {
    try {
      console.log('Fetching metrics for user:', currentUser.id);
      
      let query = supabase.from('prospects').select('*');
      
      if (currentUser.type === 'user') {
        query = query.eq('user_id', currentUser.id);
      } else if (currentUser.type === 'supervisor') {
        const { data: supervisedUsers } = await supabase
          .from('users')
          .select('id')
          .eq('supervisor_id', currentUser.id);
        
        if (!supervisedUsers) {
          console.log('No supervised users found for supervisor:', currentUser.id);
          return;
        }

        const userIds = supervisedUsers.map(user => user.id);
        userIds.push(currentUser.id);
        query = query.in('user_id', userIds);
      }

      const { data: prospectsData, error: prospectsError } = await query;
      
      if (prospectsError) {
        console.error('Error fetching prospects:', prospectsError);
        throw prospectsError;
      }

      console.log('Fetched prospects data:', prospectsData);

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const newProspectsCount = prospectsData?.filter(
        prospect => new Date(prospect.created_at) > thirtyDaysAgo
      ).length || 0;

      let emailCount = 0;
      let callCount = 0;

      prospectsData?.forEach(prospect => {
        if (prospect.activity_log) {
          prospect.activity_log.forEach((activity: any) => {
            if (activity.type === 'Email') emailCount++;
            if (activity.type === 'Phone Call') callCount++;
          });
        }
      });

      console.log('Setting metrics:', {
        totalProspects: prospectsData?.length || 0,
        newProspects: newProspectsCount,
        emailsSent: emailCount,
        callsMade: callCount,
      });

      setMetrics({
        totalProspects: prospectsData?.length || 0,
        newProspects: newProspectsCount,
        emailsSent: emailCount,
        callsMade: callCount,
      });

    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard metrics",
        variant: "destructive",
      });
    }
  };

  return { metrics, userRole };
};