import { TableCell } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import PriorityBadge from "../PriorityBadge";

interface ProspectPriorityCellProps {
  prospectId: string;
  priority: string;
  onUpdate: () => void;
}

const ProspectPriorityCell = ({ prospectId, priority, onUpdate }: ProspectPriorityCellProps) => {
  const handlePriorityChange = async (newPriority: string) => {
    try {
      console.log("Updating priority for prospect:", prospectId, "to:", newPriority);
      
      const { error } = await supabase
        .from('prospects')
        .update({ priority: newPriority })
        .eq('id', prospectId);

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
    <TableCell>
      <PriorityBadge
        priority={priority || 'Medium'}
        onPriorityChange={handlePriorityChange}
      />
    </TableCell>
  );
};

export default ProspectPriorityCell;