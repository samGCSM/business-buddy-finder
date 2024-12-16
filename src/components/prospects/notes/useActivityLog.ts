import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ActivityLogItemData } from "./ActivityLogItem";
import { Json } from "@/integrations/supabase/types";
import { getCurrentUser } from "@/services/userService";

export const useActivityLog = (prospectId: string, onSuccess: () => void) => {
  const [isUploading, setIsUploading] = useState(false);

  const getActivityLog = async (): Promise<ActivityLogItemData[]> => {
    const { data, error } = await supabase
      .from('prospects')
      .select('activity_log, user_id, users!prospects_user_id_fkey (email, type, supervisor_id)')
      .eq('id', prospectId)
      .single();

    if (error || !data) {
      console.error('Error fetching activity log:', error);
      return [];
    }

    return (data.activity_log || []).map((item) => {
      const jsonItem = item as { [key: string]: Json };
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
  };

  const sendNotification = async (recipientId: number, message: string) => {
    try {
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

  const addNote = async (note: string, existingNotes: string): Promise<boolean> => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) throw new Error('No user found');

      const timestamp = new Date().toISOString();
      const newNote = `[${timestamp}] ${note}\n`;
      const updatedNotes = existingNotes ? `${existingNotes}${newNote}` : newNote;

      const newActivity = {
        type: 'note',
        content: note,
        timestamp,
        userId: currentUser.id,
        userEmail: currentUser.email,
        userType: currentUser.type
      } as Json;

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
          `New note from ${currentUser.email} on prospect ${prospectId}`
        );
      } else if (currentUser.type === 'supervisor') {
        await sendNotification(
          prospectData?.user_id,
          `New note from supervisor on prospect ${prospectId}`
        );
      }

      toast({
        title: "Success",
        description: "Note added successfully",
      });
      onSuccess();
      return true;
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${prospectId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('prospect-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('prospect-files')
        .getPublicUrl(filePath);

      const newActivity = {
        type: 'file',
        content: 'File uploaded',
        timestamp: new Date().toISOString(),
        fileUrl: publicUrl,
        fileName: file.name
      } as Json;

      const { data: currentData } = await supabase
        .from('prospects')
        .select('activity_log')
        .eq('id', prospectId)
        .single();

      const updatedLog = [...(currentData?.activity_log || []), newActivity];

      const { error: updateError } = await supabase
        .from('prospects')
        .update({ activity_log: updatedLog })
        .eq('id', prospectId);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
      onSuccess();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return {
    handleFileUpload,
    addNote,
    isUploading,
    getActivityLog
  };
};
