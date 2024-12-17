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

      // Combine all notifications from all records and sort by timestamp
      const allNotifications = notificationsData.reduce((acc: any[], record: any) => {
        return [...acc, ...(record.notifications || [])];
      }, []);

      allNotifications.sort((a: any, b: any) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setNotifications(allNotifications);

      // Mark all notifications as read
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