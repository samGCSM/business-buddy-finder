import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
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
  const noteCount = prospect.activity_log?.filter(item => 
    typeof item === 'object' && 
    item !== null && 
    'type' in item && 
    item.type === 'note'
  ).length || 0;

  const handleStatusChange = async (newStatus: string) => {
    try {
      console.log("Updating status for prospect:", prospect.id, "to:", newStatus);
      
      const { error } = await supabase
        .from('prospects')
        .update({ status: newStatus })
        .eq('id', prospect.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Status updated successfully",
      });
      onUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    try {
      console.log("Updating priority for prospect:", prospect.id, "to:", newPriority);
      
      const { error } = await supabase
        .from('prospects')
        .update({ priority: newPriority })
        .eq('id', prospect.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Priority updated successfully",
      });
      onUpdate();
    } catch (error) {
      console.error('Error updating priority:', error);
      toast({
        title: "Error",
        description: "Failed to update priority",
        variant: "destructive",
      });
    }
  };

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
          status={prospect.status || 'New'}
          onStatusChange={(newStatus) => handleStatusChange(newStatus)}
        />
      </TableCell>
      <TableCell>
        <PriorityBadge
          priority={prospect.priority || 'Medium'}
          onPriorityChange={(newPriority) => handlePriorityChange(newPriority)}
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