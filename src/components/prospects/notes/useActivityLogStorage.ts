import { supabase } from "@/integrations/supabase/client";
import { ActivityLogItemData, convertJsonToActivityLogItem, convertActivityLogItemToJson } from "./ActivityLogItem";
import { toast } from "@/hooks/use-toast";
import { sendNotification } from "./useNotifications";
import { getCurrentUser } from "@/services/userService";
import { Json } from "@/integrations/supabase/types";

export const getActivityLog = async (prospectId: string): Promise<ActivityLogItemData[]> => {
  try {
    console.log('Fetching activity log for prospect:', prospectId);
    
    const { data, error } = await supabase
      .from('prospects')
      .select('activity_log, user_id, users!prospects_user_id_fkey (email, type, supervisor_id)')
      .eq('id', prospectId)
      .single();

    if (error) {
      console.error('Error fetching activity log:', error);
      throw error;
    }

    return (data.activity_log || []).map((item: Json) => convertJsonToActivityLogItem(item));
  } catch (error) {
    console.error('Error fetching activity log:', error);
    return [];
  }
};

export const addActivityLogItem = async (
  prospectId: string,
  item: Omit<ActivityLogItemData, 'userId' | 'userEmail' | 'userType' | 'likes'>,
  existingNotes: string
): Promise<boolean> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error('No user found');

    const timestamp = new Date().toISOString();
    const newNote = `[${timestamp}] ${item.content}\n`;
    const updatedNotes = existingNotes ? `${existingNotes}${newNote}` : newNote;

    const newActivity: ActivityLogItemData = {
      ...item,
      timestamp,
      userId: currentUser.id,
      userEmail: currentUser.email,
      userType: currentUser.type,
      likes: 0,
      replies: []
    };

    // Get prospect and user information
    const { data: prospectData } = await supabase
      .from('prospects')
      .select('user_id, users!prospects_user_id_fkey (supervisor_id, email, type)')
      .eq('id', prospectId)
      .single();

    const { data: currentData } = await supabase
      .from('prospects')
      .select('activity_log')
      .eq('id', prospectId)
      .single();

    const updatedLog = [...(currentData?.activity_log || []), convertActivityLogItemToJson(newActivity)];

    const { error } = await supabase
      .from('prospects')
      .update({
        notes: updatedNotes,
        activity_log: updatedLog,
        last_contact: new Date().toISOString()
      })
      .eq('id', prospectId);

    if (error) throw error;

    // Send notifications based on user roles
    if (currentUser.type === 'user') {
      // User added note - notify supervisor and admin
      if (prospectData?.users?.supervisor_id) {
        await sendNotification(
          prospectData.users.supervisor_id,
          `New note from ${currentUser.email} on prospect ${prospectId}`,
          prospectId
        );
      }
      
      // Notify admin (assuming admin has ID 1)
      await sendNotification(
        1, // Admin ID
        `New note from ${currentUser.email} on prospect ${prospectId}`,
        prospectId
      );
    } else {
      // Admin or supervisor added note - notify the user
      await sendNotification(
        prospectData?.user_id,
        `New note from ${currentUser.type} on prospect ${prospectId}`,
        prospectId
      );
    }

    toast({
      title: "Success",
      description: "Note added successfully",
    });
    return true;
  } catch (error) {
    console.error('Error adding activity log item:', error);
    toast({
      title: "Error",
      description: "Failed to add note",
      variant: "destructive",
    });
    return false;
  }
};

export const updateActivityLogLikes = async (
  prospectId: string,
  activityTimestamp: string,
  newLikeCount: number
): Promise<boolean> => {
  try {
    const { data: currentData } = await supabase
      .from('prospects')
      .select('activity_log')
      .eq('id', prospectId)
      .single();

    if (!currentData?.activity_log) return false;

    const updatedLog = currentData.activity_log.map((item: Json) => {
      const typedItem = convertJsonToActivityLogItem(item);
      if (typedItem.timestamp === activityTimestamp) {
        return convertActivityLogItemToJson({
          ...typedItem,
          likes: newLikeCount
        });
      }
      return item;
    });

    const { error } = await supabase
      .from('prospects')
      .update({ activity_log: updatedLog })
      .eq('id', prospectId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating likes:', error);
    return false;
  }
};