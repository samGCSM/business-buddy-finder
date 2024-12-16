import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { getCurrentUser } from "@/services/userService";

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        navigate('/login');
        return;
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

      // Get the most recent notification record
      const latestNotification = notificationsData?.reduce((latest, current) => {
        if (!latest || new Date(current.updated_at) > new Date(latest.updated_at)) {
          return current;
        }
        return latest;
      });
      
      if (latestNotification?.notifications) {
        setNotifications(latestNotification.notifications);
        
        // Mark all notifications as read
        const updatedNotifications = latestNotification.notifications.map((n: any) => ({
          ...n,
          read: true
        }));

        console.log('Marking notifications as read:', updatedNotifications);
        const { error: updateError } = await supabase
          .from('notifications')
          .update({ notifications: updatedNotifications })
          .eq('id', latestNotification.id);

        if (updateError) {
          console.error('Error updating notifications:', updateError);
          throw updateError;
        }
      }
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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
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

  const formatNotificationMessage = (notification: any) => {
    // Extract the note content from the message
    const noteMatch = notification.message.match(/New note from (.*?) on prospect/);
    if (noteMatch) {
      const userType = noteMatch[1];
      return (
        <div>
          <p className="font-medium">New note from {userType}</p>
          <p className="text-sm text-gray-600 mt-1">{notification.content}</p>
        </div>
      );
    }
    return notification.message;
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isAdmin={false} onLogout={handleLogout} />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Notifications</h1>
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <p className="text-gray-500">No notifications</p>
          ) : (
            notifications.map((notification: any, index: number) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow p-4"
              >
                {formatNotificationMessage(notification)}
                <span className="text-xs text-gray-400 block mt-2">
                  {new Date(notification.timestamp).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;