import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const NotificationIndicator = () => {
  const navigate = useNavigate();
  const [notificationCount, setNotificationCount] = useState(0);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);

  useEffect(() => {
    const checkNotifications = async () => {
      try {
        const currentUserStr = localStorage.getItem('currentUser');
        if (!currentUserStr) {
          console.log('No current user found in localStorage');
          return;
        }

        const currentUser = JSON.parse(currentUserStr);
        console.log('Checking notifications for user:', currentUser.id);
        
        const { data: notificationsData, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', currentUser.id);

        if (error) {
          console.error('Error fetching notifications:', error);
          return;
        }

        // Find the most recent notification record
        const latestNotification = notificationsData?.reduce((latest, current) => {
          if (!latest || new Date(current.updated_at) > new Date(latest.updated_at)) {
            return current;
          }
          return latest;
        }, null);

        if (!latestNotification) {
          console.log('No notifications found, creating new record');
          const { error: insertError } = await supabase
            .from('notifications')
            .insert([{ 
              user_id: currentUser.id,
              notifications: []
            }]);

          if (insertError) {
            console.error('Error creating notifications record:', insertError);
          }
          
          setNotificationCount(0);
          setHasNewNotifications(false);
          return;
        }

        const unreadCount = latestNotification.notifications?.filter((n: any) => !n.read)?.length || 0;
        setNotificationCount(unreadCount);
        setHasNewNotifications(unreadCount > 0);
      } catch (error) {
        console.error('Error in checkNotifications:', error);
      }
    };

    checkNotifications();
    
    // Set up real-time subscription
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

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={() => navigate('/notifications')}
    >
      <Bell className="h-5 w-5" />
      {hasNewNotifications && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
      )}
      {notificationCount > 0 && (
        <Badge 
          variant="secondary" 
          className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center rounded-full text-xs"
        >
          {notificationCount}
        </Badge>
      )}
    </Button>
  );
};

export default NotificationIndicator;