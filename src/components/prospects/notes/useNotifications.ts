import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const sendNotification = async (recipientId: number, message: string, prospectId: string, content: string) => {
  try {
    console.log('Sending notification to user:', recipientId);
    const { data: existingNotifications, error: fetchError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', recipientId);

    if (fetchError) {
      console.error('Error fetching notifications:', fetchError);
      throw fetchError;
    }

    const newNotification = {
      message,
      content,
      timestamp: new Date().toISOString(),
      read: false,
      prospectId
    };

    // If no notifications exist for this user, create a new record
    if (!existingNotifications || existingNotifications.length === 0) {
      const { error: insertError } = await supabase
        .from('notifications')
        .insert([{ 
          user_id: recipientId,
          notifications: [newNotification]
        }]);

      if (insertError) {
        console.error('Error creating notification:', insertError);
        throw insertError;
      }
    } else {
      // Update the most recent notification record
      const mostRecentNotification = existingNotifications[existingNotifications.length - 1];
      const updatedNotifications = [...(mostRecentNotification.notifications || []), newNotification];

      const { error: updateError } = await supabase
        .from('notifications')
        .update({ notifications: updatedNotifications })
        .eq('id', mostRecentNotification.id);

      if (updateError) {
        console.error('Error updating notifications:', updateError);
        throw updateError;
      }
    }

    // Trigger real-time notification
    const channel = supabase.channel('notifications');
    channel.send({
      type: 'broadcast',
      event: 'new_notification',
      payload: { userId: recipientId }
    });

  } catch (error) {
    console.error('Error sending notification:', error);
    toast({
      title: "Error",
      description: "Failed to send notification",
      variant: "destructive",
    });
  }
};

export const setupNotificationListener = (userId: number, onNotification: () => void) => {
  const channel = supabase.channel('notifications')
    .on(
      'broadcast',
      { event: 'new_notification' },
      (payload) => {
        if (payload.payload.userId === userId) {
          onNotification();
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};