import { supabase } from "@/integrations/supabase/client";
import { ActivityLogItemData } from "./ActivityLogItem";
import { toast } from "@/hooks/use-toast";
import { sendNotification } from "./useNotifications";

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

    return (data.activity_log || []).map((item) => {
      const jsonItem = item as { [key: string]: any };
      return {
        type: jsonItem.type as ActivityLogItemData['type'],
        content: jsonItem.content as string,
        timestamp: jsonItem.timestamp as string,
        fileUrl: jsonItem.fileUrl as string | undefined,
        fileName: jsonItem.fileName as string | undefined,
        userId: jsonItem.userId as number | undefined,
        userEmail: jsonItem.userEmail as string | undefined,
        userType: jsonItem.userType as string | undefined,
      };
    });
  } catch (error) {
    console.error('Error fetching activity log:', error);
    return [];
  }
};

export const addActivityLogItem = async (
  prospectId: string,
  item: Omit<ActivityLogItemData, 'userId' | 'userEmail' | 'userType'>,
  existingNotes: string
): Promise<boolean> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error('No user found');

    const timestamp = new Date().toISOString();
    const newNote = `[${timestamp}] ${item.content}\n`;
    const updatedNotes = existingNotes ? `${existingNotes}${newNote}` : newNote;

    const newActivity = {
      ...item,
      timestamp,
      userId: currentUser.id,
      userEmail: currentUser.email,
      userType: currentUser.type
    };

    const { data: prospectData } = await supabase
      .from('prospects')
      .select('user_id, users!prospects_user_id_fkey (supervisor_id, email)')
      .eq('id', prospectId)
      .single();

    const { data: currentData } = await supabase
      .from('prospects')
      .select('activity_log')
      .eq('id', prospectId)
      .single();

    const updatedLog = [...(currentData?.activity_log || []), newActivity];

    const { error } = await supabase
      .from('prospects')
      .update({
        notes: updatedNotes,
        activity_log: updatedLog,
        last_contact: new Date().toISOString()
      })
      .eq('id', prospectId);

    if (error) throw error;

    // Send notification based on user type
    if (currentUser.type === 'user' && prospectData?.users?.supervisor_id) {
      await sendNotification(
        prospectData.users.supervisor_id,
        `New note from ${currentUser.email} on prospect ${prospectId}`,
        prospectId
      );
    } else if (currentUser.type === 'supervisor') {
      await sendNotification(
        prospectData?.user_id,
        `New note from supervisor on prospect ${prospectId}`,
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