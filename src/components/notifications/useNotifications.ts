import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { getCurrentUser } from "@/services/userService";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        throw new Error('No current user found');
      }

      console.log('Fetching notifications for user:', currentUser.id);
      const { data: notificationsData, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', currentUser.id);

      if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
      }

      // Get all prospect IDs from notifications
      const prospectIds = notificationsData.reduce((acc: string[], record: any) => {
        const prospectIdsFromRecord = record.notifications?.map((n: any) => n.prospectId) || [];
        return [...acc, ...prospectIdsFromRecord];
      }, []);

      // Fetch business names for all prospects
      const { data: prospectsData, error: prospectsError } = await supabase
        .from('prospects')
        .select('id, business_name')
        .in('id', prospectIds);

      if (prospectsError) {
        console.error('Error fetching prospects:', prospectsError);
        throw prospectsError;
      }

      // Create a map of prospect IDs to business names
      const businessNameMap = prospectsData.reduce((acc: {[key: string]: string}, prospect: any) => {
        acc[prospect.id] = prospect.business_name;
        return acc;
      }, {});

      const allNotifications = notificationsData.reduce((acc: any[], record: any) => {
        const notificationsWithBusinessNames = (record.notifications || []).map((notification: any) => ({
          ...notification,
          businessName: businessNameMap[notification.prospectId] || 'Unknown Business'
        }));
        return [...acc, ...notificationsWithBusinessNames];
      }, []);

      allNotifications.sort((a: any, b: any) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setNotifications(allNotifications);

      const updatePromises = notificationsData.map(record => {
        const updatedNotifications = record.notifications.map((n: any) => ({
          ...n,
          read: true
        }));

        return supabase
          .from('notifications')
          .update({ notifications: updatedNotifications })
          .eq('id', record.id);
      });

      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error in fetchNotifications:', error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return {
    notifications,
    isLoading
  };
};