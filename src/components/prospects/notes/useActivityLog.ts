import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { getCurrentUser } from "@/services/userService";
import { ActivityLogItemData } from "./ActivityLogItem";
import { Json } from "@/integrations/supabase/types";

export const useActivityLog = (prospectId: string, onUpdate: () => void) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsUploading(true);
    try {
      const file = event.target.files?.[0];
      if (!file) {
        toast({
          title: "Error",
          description: "No file selected",
          variant: "destructive",
        });
        return;
      }

      const timestamp = new Date().toISOString();
      const filePath = `prospects/${prospectId}/activity_log/${timestamp}-${file.name}`;

      const { data, error } = await supabase.storage
        .from('files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error("File upload error:", error);
        toast({
          title: "Error",
          description: "Failed to upload file",
          variant: "destructive",
        });
        return;
      }

      const fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${data.path}`;

      const currentUser = await getCurrentUser();
      if (!currentUser) {
        toast({
          title: "Error",
          description: "User not found",
          variant: "destructive",
        });
        return;
      }

      const newActivity: ActivityLogItemData = {
        type: file.type.startsWith('image/') ? 'image' : 'file',
        content: `Uploaded ${file.type.startsWith('image/') ? 'image' : 'file'}`,
        timestamp,
        userId: currentUser.id,
        userEmail: currentUser.email || '',
        userType: currentUser.type || 'user',
        likes: 0,
        fileUrl: fileUrl,
        fileName: file.name,
      };

      const { data: currentData } = await supabase
        .from('prospects')
        .select('activity_log')
        .eq('id', prospectId)
        .single();

      const updatedLog = [...(currentData?.activity_log || []), newActivity] as Json[];

      const { error: updateError } = await supabase
        .from('prospects')
        .update({
          activity_log: updatedLog,
          last_contact: new Date().toISOString()
        })
        .eq('id', prospectId);

      if (updateError) {
        console.error("Failed to update activity log:", updateError);
        toast({
          title: "Error",
          description: "Failed to update activity log",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
      onUpdate();

    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const addNote = async (newNote: string, existingNotes: string) => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        toast({
          title: "Error",
          description: "User not found",
          variant: "destructive",
        });
        return false;
      }

      const timestamp = new Date().toISOString();
      const updatedNotes = existingNotes ? `${existingNotes}\n${newNote}` : newNote;

      const newActivity: ActivityLogItemData = {
        type: 'note',
        content: newNote,
        timestamp,
        userId: currentUser.id,
        userEmail: currentUser.email || '',
        userType: currentUser.type || 'user',
        likes: 0
      };

      const { data: currentData } = await supabase
        .from('prospects')
        .select('activity_log')
        .eq('id', prospectId)
        .single();

      const updatedLog = [...(currentData?.activity_log || []), newActivity] as Json[];

      const { error } = await supabase
        .from('prospects')
        .update({
          notes: updatedNotes,
          activity_log: updatedLog
        })
        .eq('id', prospectId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Note added successfully",
      });
      
      onUpdate();
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

  const getActivityLog = async (prospectId: string): Promise<ActivityLogItemData[]> => {
    try {
      console.log('Fetching activity log for prospect:', prospectId);
      
      const { data, error } = await supabase
        .from('prospects')
        .select('activity_log')
        .eq('id', prospectId)
        .single();

      if (error) throw error;

      return (data?.activity_log || []).map((item: Json) => {
        if (typeof item === 'object' && item !== null) {
          return {
            type: item.type as 'note' | 'file' | 'image',
            content: item.content as string,
            timestamp: item.timestamp as string,
            userId: item.userId as number,
            userEmail: item.userEmail as string,
            userType: item.userType as string,
            likes: (item.likes as number) || 0,
            fileUrl: item.fileUrl as string | undefined,
            fileName: item.fileName as string | undefined,
          };
        }
        return {
          type: 'note',
          content: '',
          timestamp: new Date().toISOString(),
          likes: 0,
          userId: 0,
          userEmail: '',
          userType: '',
        };
      });
    } catch (error) {
      console.error('Error fetching activity log:', error);
      return [];
    }
  };

  return { handleFileUpload, addNote, isUploading, getActivityLog };
};

export const setupNotificationListener = (userId: number, onNewNotification: () => void) => {
  const channel = supabase
    .channel(`user_notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `target_user_id=eq.${userId}`,
      },
      (payload) => {
        console.log('Received notification:', payload);
        onNewNotification();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
