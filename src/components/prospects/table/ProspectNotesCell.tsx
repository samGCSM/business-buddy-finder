import { TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import ProspectNotes from "../ProspectNotes";

interface ProspectNotesCellProps {
  prospectId: string;
  notes: string;
  activityLog: any[];
  onUpdate: () => void;
}

const ProspectNotesCell = ({ prospectId, notes, activityLog, onUpdate }: ProspectNotesCellProps) => {
  const noteCount = activityLog?.filter(item => 
    typeof item === 'object' && 
    item !== null && 
    'type' in item && 
    item.type === 'note'
  ).length || 0;

  return (
    <TableCell>
      <div className="relative inline-flex">
        <ProspectNotes
          prospectId={prospectId}
          existingNotes={notes}
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