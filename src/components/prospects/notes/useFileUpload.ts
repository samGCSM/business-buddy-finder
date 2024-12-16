import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ActivityLogItemData } from "./ActivityLogItem";
import { addActivityLogItem } from "./useActivityLogStorage";

export const useFileUpload = (prospectId: string, onSuccess: () => void) => {
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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

      const newActivity: Omit<ActivityLogItemData, 'userId' | 'userEmail' | 'userType'> = {
        type: 'file',
        content: 'File uploaded',
        timestamp: new Date().toISOString(),
        fileUrl: publicUrl,
        fileName: file.name
      };

      const success = await addActivityLogItem(prospectId, newActivity, '');
      if (success) {
        toast({
          title: "Success",
          description: "File uploaded successfully",
        });
        onSuccess();
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    }
  };

  return {
    handleFileUpload
  };
};