import { supabase } from "@/integrations/supabase/client";

export const sendNotification = async (recipientId: number, message: string, prospectId: string, content: string) => {
  try {
    console.log('Sending notification to user:', recipientId);
    const { data: existingNotifications, error: fetchError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', recipientId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching notifications:', fetchError);
      return;
    }

    let notifications = existingNotifications?.notifications || [];
    const newNotification = {
      message,
      content,
      timestamp: new Date().toISOString(),
      read: false,
      prospectId
    };

    if (!existingNotifications) {
      // Create new notifications record
      const { error: insertError } = await supabase
        .from('notifications')
        .insert([{ 
          user_id: recipientId,
          notifications: [newNotification]
        }]);

      if (insertError) {
        console.error('Error creating notification:', insertError);
      }
    } else {
      // Update existing notifications
      notifications = [...notifications, newNotification];
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ notifications })
        .eq('user_id', recipientId);

      if (updateError) {
        console.error('Error updating notifications:', updateError);
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