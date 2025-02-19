
import { TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import ProspectNotes from "../ProspectNotes";
import { Json } from "@/integrations/supabase/types";
import { ActivityLogItemData } from "../notes/ActivityLogItem";

interface ProspectNotesCellProps {
  prospectId: string;
  notes: string;
  activityLog: Json[] | null;
  onUpdate: () => void;
}

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
  [key: string]: Json | undefined;  // Add index signature for Json compatibility
}

const isActivityLogJson = (item: Json): item is ActivityLogJson => {
  if (typeof item !== 'object' || item === null) return false;

  const requiredFields = ['type', 'content', 'timestamp', 'userId', 'userEmail', 'userType'];
  return requiredFields.every(field => field in item);
};

const ProspectNotesCell = ({ prospectId, notes, activityLog, onUpdate }: ProspectNotesCellProps) => {
  // Convert activity log from Json[] to ActivityLogItemData[]
  const formattedActivityLog: ActivityLogItemData[] = activityLog?.map(item => {
    if (!isActivityLogJson(item)) {
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
  }) || [];

  const noteCount = formattedActivityLog.filter(item => 
    item.type === 'note'
  ).length || 0;

  return (
    <TableCell>
      <div className="relative inline-flex">
        <ProspectNotes
          prospectId={prospectId}
          existingNotes={notes || ''}
          onNotesUpdated={onUpdate}
        />
        {noteCount > 0 && (
          <Badge 
            variant="secondary" 
            className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center rounded-full text-xs"
          >
            {noteCount}
          </Badge>
        )}
      </div>
    </TableCell>
  );
};

export default ProspectNotesCell;
