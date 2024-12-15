import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ActivityLogItemData } from "./ActivityLogItem";
import { Json } from "@/integrations/supabase/types";

export const useActivityLog = (prospectId: string, onSuccess: () => void) => {
  const [isUploading, setIsUploading] = useState(false);

  const getActivityLog = async (): Promise<ActivityLogItemData[]> => {
    const { data, error } = await supabase
      .from('prospects')
      .select('activity_log')
      .eq('id', prospectId)
      .single();

    if (error || !data) {
      console.error('Error fetching activity log:', error);
      return [];
    }

    // Convert the Json[] to ActivityLogItemData[]
    return (data.activity_log || []).map((item) => {
      const jsonItem = item as { [key: string]: Json };
      return {
        type: jsonItem.type as ActivityLogItemData['type'],
        content: jsonItem.content as string,
        timestamp: jsonItem.timestamp as string,
        fileUrl: jsonItem.fileUrl as string | undefined,
        fileName: jsonItem.fileName as string | undefined
      };
    });
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

  const addNote = async (note: string, existingNotes: string): Promise<boolean> => {
    try {
      const timestamp = new Date().toISOString();
      const newNote = `[${timestamp}] ${note}\n`;
      const updatedNotes = existingNotes ? `${existingNotes}${newNote}` : newNote;

      const newActivity = {
        type: 'note',
        content: note,
        timestamp
      } as Json;

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

  return {
    handleFileUpload,
    addNote,
    isUploading,
    getActivityLog
  };
};