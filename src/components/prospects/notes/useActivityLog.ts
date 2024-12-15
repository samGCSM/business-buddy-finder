import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ActivityLogItemData } from "./ActivityLogItem";
import { Json } from "@/integrations/supabase/types";

export const useActivityLog = (prospectId: string, onUpdate: () => void) => {
  const [isUploading, setIsUploading] = useState(false);

  const getActivityLog = async (): Promise<ActivityLogItemData[]> => {
    const { data, error } = await supabase
      .from('prospects')
      .select('activity_log')
      .eq('id', prospectId)
      .single();

    if (error) {
      console.error('Error fetching activity log:', error);
      return [];
    }

    // Convert the Json[] to ActivityLogItemData[]
    return (data.activity_log || []).map((item: Json) => ({
      type: item.type as ActivityLogItemData['type'],
      content: item.content as string,
      timestamp: item.timestamp as string,
      fileUrl: item.fileUrl as string | undefined,
      fileName: item.fileName as string | undefined
    }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${prospectId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('prospect-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('prospect-files')
        .getPublicUrl(filePath);

      const timestamp = new Date().toISOString();
      const fileType = file.type.startsWith('image/') ? 'image' : 'file';
      
      const newLogItem: ActivityLogItemData = {
        type: fileType,
        content: `Uploaded ${fileType}: ${file.name}`,
        timestamp,
        fileUrl: publicUrl,
        fileName: file.name
      };

      const currentLog = await getActivityLog();
      const { error: updateError } = await supabase
        .from('prospects')
        .update({ 
          activity_log: [...currentLog, newLogItem as unknown as Json],
          last_contact: timestamp
        })
        .eq('id', prospectId);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
      
      onUpdate();
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

  const addNote = async (note: string, existingNotes: string) => {
    if (!note.trim()) return;

    const timestamp = new Date().toISOString();
    const newLogItem: ActivityLogItemData = {
      type: 'note',
      content: note,
      timestamp
    };

    try {
      const currentLog = await getActivityLog();
      const { error } = await supabase
        .from('prospects')
        .update({ 
          notes: existingNotes 
            ? `${existingNotes}\n[${new Date().toLocaleString()}] ${note}`
            : `[${new Date().toLocaleString()}] ${note}`,
          activity_log: [...currentLog, newLogItem as unknown as Json],
          last_contact: timestamp
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
      console.error('Error saving note:', error);
      toast({
        title: "Error",
        description: "Failed to save note",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    getActivityLog,
    handleFileUpload,
    addNote,
    isUploading
  };
};