import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface DashboardMetrics {
  totalProspects: number;
  newProspects: number;
  emailsSent: number;
  faceToFace: number;
}

export const useDashboardMetrics = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalProspects: 0,
    newProspects: 0,
    emailsSent: 0,
    faceToFace: 0,
  });

  const fetchDashboardMetrics = async (currentUser: any) => {
    try {
      console.log('Fetching metrics for user:', currentUser.id);

      const { data, error } = await supabase.rpc('get_dashboard_metrics', {
        p_user_id: currentUser.id,
        p_user_type: currentUser.type,
      });

      if (error) {
        console.error('Error fetching dashboard metrics:', error);
        throw error;
      }

      console.log('Dashboard metrics RPC result:', data);

      const row = Array.isArray(data) ? data[0] : data;

      if (row) {
        setMetrics({
          totalProspects: Number(row.total_prospects) || 0,
          newProspects: Number(row.new_prospects) || 0,
          emailsSent: Number(row.emails_sent) || 0,
          faceToFace: Number(row.face_to_face) || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard metrics",
        variant: "destructive",
      });
    }
  };

  return { metrics, fetchDashboardMetrics };
};
