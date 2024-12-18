import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useNotificationState = () => {
  const [notificationCount, setNotificationCount] = useState(0);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);

  const checkNotifications = async () => {
    try {
      const currentUserStr = localStorage.getItem('currentUser');
      if (!currentUserStr) {
        console.log('No current user found in localStorage');
        return;
      }

      const currentUser = JSON.parse(currentUserStr);
      console.log('Checking notifications for user:', currentUser.id);
      
      // Remove .single() since we expect multiple records
      const { data: notificationsData, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', currentUser.id);

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      console.log('Fetched notifications:', notificationsData);

      // Calculate total unread notifications across all notification records
      let totalUnread = 0;
      notificationsData?.forEach(record => {
        const unreadCount = record.notifications?.filter((n: any) => !n.read)?.length || 0;
        totalUnread += unreadCount;
      });

      setNotificationCount(totalUnread);
      setHasNewNotifications(totalUnread > 0);
    } catch (error) {
      console.error('Error in checkNotifications:', error);
    }
  };

  useEffect(() => {
    checkNotifications();
    
    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'notifications' 
      }, () => {
        checkNotifications();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    notificationCount,
    hasNewNotifications
  };
};