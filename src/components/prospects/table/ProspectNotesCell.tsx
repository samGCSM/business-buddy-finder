
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

const ProspectNotesCell = ({ prospectId, notes, activityLog, onUpdate }: ProspectNotesCellProps) => {
  // Convert activity log from Json[] to ActivityLogItemData[]
  const formattedActivityLog: ActivityLogItemData[] = activityLog?.map(item => {
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
