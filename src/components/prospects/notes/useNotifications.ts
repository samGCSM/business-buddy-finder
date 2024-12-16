import { supabase } from "@/integrations/supabase/client";

export const sendNotification = async (recipientId: number, message: string, prospectId: string) => {
  try {
    console.log('Sending notification to user:', recipientId);
    const { data: existingNotifications } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', recipientId)
      .single();

    const notifications = existingNotifications?.notifications || [];
    notifications.push({
      message,
      timestamp: new Date().toISOString(),
      read: false,
      prospectId
    });

    await supabase
      .from('notifications')
      .upsert({ 
        user_id: recipientId,
        notifications 
      });

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