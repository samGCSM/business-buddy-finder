import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MobileNavigation from "./navigation/MobileNavigation";
import DesktopNavigation from "./navigation/DesktopNavigation";
import { useState, useEffect } from "react";

const Header = ({ isAdmin, onLogout }: { isAdmin: boolean; onLogout: () => void }) => {
  const navigate = useNavigate();
  const [notificationCount, setNotificationCount] = useState(0);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);

  useEffect(() => {
    const checkNotifications = async () => {
      try {
        const currentUserStr = localStorage.getItem('currentUser');
        if (currentUserStr) {
          const currentUser = JSON.parse(currentUserStr);
          
          // Get all notifications for the user
          let { data: notificationsData, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', currentUser.id);

          if (error) {
            console.error('Error fetching notifications:', error);
            return;
          }

          // If no notifications exist, create one
          if (!notificationsData || notificationsData.length === 0) {
            console.log('Creating new notifications record for user:', currentUser.id);
            const { data: newNotification, error: insertError } = await supabase
              .from('notifications')
              .insert([{ 
                user_id: currentUser.id,
                notifications: []
              }])
              .select();

            if (insertError) {
              console.error('Error creating notifications record:', insertError);
              return;
            }
            notificationsData = newNotification;
          }

          // Get the most recent notification record
          const latestNotification = notificationsData.reduce((latest: any, current: any) => {
            if (!latest || new Date(current.updated_at) > new Date(latest.updated_at)) {
              return current;
            }
            return latest;
          }, null);

          if (latestNotification) {
            setNotificationCount(latestNotification.notifications?.length || 0);
            // Check if there are any unread notifications
            const hasUnread = latestNotification.notifications?.some((n: any) => !n.read) || false;
            setHasNewNotifications(hasUnread);
          }
        }
      } catch (error) {
        console.error('Error in checkNotifications:', error);
      }
    };

    checkNotifications();
    
    // Set up real-time subscription for notifications
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

  const handleLogout = async () => {
    try {
      console.log("Header - Logging out");
      onLogout();
      localStorage.removeItem('currentUser');
      await supabase.auth.signOut();
      console.log("Header - Logged out successfully");
      navigate("/login");
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="bg-white shadow-sm py-4 px-6 mb-8">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <img 
            src="/lovable-uploads/a39fe416-87d2-481d-bf99-5a86c104e18e.png" 
            alt="Sales Storm Logo" 
            className="w-12 h-12"
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
          />
          <span className="text-xl font-semibold">Sales Storm Prospecting</span>
        </div>

        <div className="flex items-center space-x-4">
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
          <DesktopNavigation isAdmin={isAdmin} onLogout={handleLogout} />
          <MobileNavigation isAdmin={isAdmin} onLogout={handleLogout} />
        </div>
      </div>
    </header>
  );
};

export default Header;