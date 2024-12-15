import { Table, TableBody } from "@/components/ui/table";
import { useState } from "react";
import EditProspectForm from "./EditProspectForm";
import ProspectTableHeader from "./ProspectTableHeader";
import ProspectTableRow from "./ProspectTableRow";
import type { Prospect } from "@/types/prospects";

interface ProspectsTableProps {
  prospects: Prospect[];
  onUpdate: () => void;
}

const ProspectsTable = ({ prospects, onUpdate }: ProspectsTableProps) => {
  const [editingProspect, setEditingProspect] = useState<Prospect | null>(null);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('prospects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Prospect deleted successfully",
      });
      onUpdate();
    } catch (error) {
      console.error('Error deleting prospect:', error);
      toast({
        title: "Error",
        description: "Failed to delete prospect",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {editingProspect && (
        <EditProspectForm
          prospect={editingProspect}
          onClose={() => setEditingProspect(null)}
          onSuccess={() => {
            setEditingProspect(null);
            onUpdate();
          }}
        />
      )}
      <div className="overflow-x-auto">
        <Table>
          <ProspectTableHeader />
          <TableBody>
            {prospects.map((prospect) => (
              <ProspectTableRow
                key={prospect.id}
                prospect={prospect}
                onEdit={setEditingProspect}
                onDelete={handleDelete}
                onUpdate={onUpdate}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ProspectsTable;