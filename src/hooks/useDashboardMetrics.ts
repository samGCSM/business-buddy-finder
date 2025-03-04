
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { toZonedTime } from "date-fns-tz";
import { subDays } from "date-fns";

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

      // For 30 days new prospects calculation
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // For 7 days emails and face-to-face calculation
      const sevenDaysAgo = subDays(new Date(), 7);
      const timeZone = 'America/New_York'; // EST timezone
      const sevenDaysAgoInEST = toZonedTime(sevenDaysAgo, timeZone);
      
      const newProspectsCount = prospectsData?.filter(
        prospect => new Date(prospect.created_at) > thirtyDaysAgo
      ).length || 0;

      let emailCount = 0;
      let faceToFaceCount = 0;

      prospectsData?.forEach(prospect => {
        if (prospect.activity_log) {
          prospect.activity_log.forEach((activity: any) => {
            const activityDate = new Date(activity.timestamp);
            
            // Only count activities from the last 7 days
            if (activityDate >= sevenDaysAgoInEST) {
              if (activity.type === 'Email') {
                emailCount++;
                console.log('Found email activity:', activity);
              }
              
              // Use the same normalized case check as in graph and user table
              const activityType = activity.type ? activity.type.toLowerCase() : '';
              if (activityType === 'face to face') {
                // Debug the activity to confirm what's being counted
                console.log('Dashboard: Found face to face activity:', activity);
                faceToFaceCount++;
              }
            }
          });
        }
      });

      console.log('Setting metrics:', {
        totalProspects: prospectsData?.length || 0,
        newProspects: newProspectsCount,
        emailsSent: emailCount,
        faceToFace: faceToFaceCount,
      });

      setMetrics({
        totalProspects: prospectsData?.length || 0,
        newProspects: newProspectsCount,
        emailsSent: emailCount,
        faceToFace: faceToFaceCount,
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

  return { metrics, fetchDashboardMetrics };
};
