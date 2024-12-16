import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUser } from "@/services/userService";

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
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUserRole(currentUser.type as 'admin' | 'supervisor' | 'user');
        setUserId(currentUser.id);
      }
      fetchDashboardMetrics(currentUser);
    };

    initializePage();
  }, []);

  const fetchDashboardMetrics = async (currentUser: any) => {
    try {
      let query = supabase.from('prospects').select('*');
      
      if (currentUser.type === 'user') {
        query = query.eq('user_id', currentUser.id);
      } else if (currentUser.type === 'supervisor') {
        const { data: supervisedUsers } = await supabase
          .from('users')
          .select('id')
          .eq('supervisor_id', currentUser.id);
        
        const userIds = supervisedUsers?.map(user => user.id) || [];
        userIds.push(currentUser.id);
        query = query.in('user_id', userIds);
      }

      const { data: prospectsData, error: prospectsError } = await query;
      
      if (prospectsError) throw prospectsError;

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

      setMetrics({
        totalProspects: prospectsData?.length || 0,
        newProspects: newProspectsCount,
        emailsSent: emailCount,
        callsMade: callCount,
      });

    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
    }
  };

  return { metrics, userRole };
};