
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
}

const ProspectNotesCell = ({ prospectId, notes, activityLog, onUpdate }: ProspectNotesCellProps) => {
  // Convert activity log from Json[] to ActivityLogItemData[]
  const formattedActivityLog: ActivityLogItemData[] = activityLog?.map(item => {
    // Cast the Json item to our expected shape
    const logItem = item as ActivityLogJson;
    
    return {
      type: logItem.type as 'note' | 'file' | 'image',
      content: logItem.content,
      timestamp: logItem.timestamp,
      userId: logItem.userId,
      userEmail: logItem.userEmail,
      userType: logItem.userType,
      likes: logItem.likes || 0,
      fileUrl: logItem.fileUrl,
      fileName: logItem.fileName,
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
