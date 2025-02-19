import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { getCurrentUser } from "@/services/userService";
import { ActivityLogItemData } from "./ActivityLogItem";
import { Json } from "@/integrations/supabase/types";

interface ActivityLogJson {
  type: string;
  content: string;
  timestamp: string;
  userId: number;
  userEmail: string;
  userType: string;
  likes: number;
  fileUrl?: string;
  fileName?: string;
  [key: string]: Json | undefined;
}

const isActivityLogItem = (item: Json): item is ActivityLogItemData => {
  if (typeof item !== 'object' || item === null) return false;

  const requiredFields = ['type', 'content', 'timestamp', 'userId', 'userEmail', 'userType'];
  return requiredFields.every(field => field in item);
};

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
        if (!isActivityLogItem(item)) {
          console.warn('Invalid activity log item:', item);
          return {
            type: 'note',
            content: 'Invalid log entry',
            timestamp: new Date().toISOString(),
            userId: 0,
            userEmail: '',
            userType: '',
            likes: 0
          };
        }

        return {
          type: item.type as 'note' | 'file' | 'image',
          content: String(item.content),
          timestamp: String(item.timestamp),
          userId: Number(item.userId),
          userEmail: String(item.userEmail),
          userType: String(item.userType),
          likes: Number(item.likes) || 0,
          fileUrl: item.fileUrl ? String(item.fileUrl) : undefined,
          fileName: item.fileName ? String(item.fileName) : undefined,
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
