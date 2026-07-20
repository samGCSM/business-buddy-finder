import { Button } from "@/components/ui/button";
import { Pencil, Phone } from "lucide-react";
import type { Prospect } from "@/types/prospects";

interface ProspectActionsProps {
  prospect: Prospect;
  onEdit: (prospect: Prospect) => void;
  onDelete: (id: string) => void;
  onAddToCalls?: (prospect: Prospect) => void;
}

const ProspectActions = ({ prospect, onEdit, onDelete, onAddToCalls }: ProspectActionsProps) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onEdit(prospect)}
        title="Edit"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      {onAddToCalls && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
          onClick={() => onAddToCalls(prospect)}
          title="Add to Calls Report"
        >
          <Phone className="h-4 w-4" />
        </Button>
      )}
      <Button
        variant="destructive"
        size="sm"
        onClick={() => onDelete(prospect.id)}
      >
        Delete
      </Button>
    </div>
  );
};

export default ProspectActions;
