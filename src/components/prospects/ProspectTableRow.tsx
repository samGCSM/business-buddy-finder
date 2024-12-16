import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import ProspectNotes from "./ProspectNotes";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";
import LastContactCell from "./LastContactCell";
import type { Prospect } from "@/types/prospects";
import { Badge } from "@/components/ui/badge";

interface ProspectTableRowProps {
  prospect: Prospect;
  onEdit: (prospect: Prospect) => void;
  onDelete: (id: string) => void;
  onUpdate: () => void;
}

const ProspectTableRow = ({ prospect, onEdit, onDelete, onUpdate }: ProspectTableRowProps) => {
  // Calculate number of notes from activity log
  const noteCount = prospect.activity_log?.filter(item => 
    typeof item === 'object' && 
    item !== null && 
    'type' in item && 
    item.type === 'note'
  ).length || 0;

  return (
    <TableRow key={prospect.id}>
      <TableCell className="sticky left-0 bg-white font-medium whitespace-nowrap">
        {prospect.business_name}
      </TableCell>
      <TableCell>
        <div className="relative inline-flex">
          <ProspectNotes
            prospectId={prospect.id}
            existingNotes={prospect.notes}
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
      <TableCell>
        {prospect.website ? (
          <a 
            href={prospect.website.startsWith('http') ? prospect.website : `https://${prospect.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            {prospect.website}
          </a>
        ) : null}
      </TableCell>
      <TableCell>{prospect.email}</TableCell>
      <TableCell>{prospect.business_address}</TableCell>
      <TableCell>{prospect.phone_number}</TableCell>
      <TableCell>{prospect.owner_name}</TableCell>
      <TableCell>
        <StatusBadge
          status={prospect.status}
          onStatusChange={(newStatus) => {
            // Handle status change
          }}
        />
      </TableCell>
      <TableCell>
        <PriorityBadge
          priority={prospect.priority}
          onPriorityChange={(newPriority) => {
            // Handle priority change
          }}
        />
      </TableCell>
      <TableCell>{prospect.owner_phone}</TableCell>
      <TableCell>{prospect.owner_email}</TableCell>
      <TableCell>
        <LastContactCell
          prospectId={prospect.id}
          prospectName={prospect.business_name}
          lastContact={prospect.last_contact}
          onUpdate={onUpdate}
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onEdit(prospect)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(prospect.id)}
          >
            Delete
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default ProspectTableRow;