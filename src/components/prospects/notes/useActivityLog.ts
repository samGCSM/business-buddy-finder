import { useState } from "react";
import { ActivityLogItemData } from "./ActivityLogItem";
import { getActivityLog, addActivityLogItem } from "./useActivityLogStorage";
import { useFileUpload } from "./useFileUpload";

export const useActivityLog = (prospectId: string, onSuccess: () => void) => {
  const [isUploading, setIsUploading] = useState(false);
  const { handleFileUpload: handleUpload } = useFileUpload(prospectId, onSuccess);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsUploading(true);
    try {
      await handleUpload(event);
    } finally {
      setIsUploading(false);
    }
  };

  const addNote = async (note: string, existingNotes: string): Promise<boolean> => {
    const newActivity: Omit<ActivityLogItemData, 'userId' | 'userEmail' | 'userType'> = {
      type: 'note',
      content: note,
      timestamp: new Date().toISOString(),
      likes: 0
    };

    return addActivityLogItem(prospectId, newActivity, existingNotes);
  };

  return {
    handleFileUpload,
    addNote,
    isUploading,
    getActivityLog
  };
};

export * from './useNotifications';