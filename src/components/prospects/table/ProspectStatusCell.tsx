import { TableCell } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import StatusBadge from "../StatusBadge";

interface ProspectStatusCellProps {
  prospectId: string;
  status: string;
  onUpdate: () => void;
}

const ProspectStatusCell = ({ prospectId, status, onUpdate }: ProspectStatusCellProps) => {
  const handleStatusChange = async (newStatus: string) => {
    try {
      console.log("Updating status for prospect:", prospectId, "to:", newStatus);
      
      const { error } = await supabase
        .from('prospects')
        .update({ status: newStatus })
        .eq('id', prospectId);

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

  return (
    <TableCell>
      <StatusBadge
        status={status || 'New'}
        onStatusChange={handleStatusChange}
      />
    </TableCell>
  );
};

export default ProspectStatusCell;