import { Table, TableBody } from "@/components/ui/table";
import { useState } from "react";
import EditProspectForm from "./EditProspectForm";
import ProspectTableHeader from "./ProspectTableHeader";
import ProspectTableRow from "./ProspectTableRow";
import type { Prospect } from "@/types/prospects";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ProspectsTableProps {
  prospects: Prospect[];
  onUpdate: () => void;
}

type SortConfig = {
  key: keyof Prospect;
  direction: 'asc' | 'desc';
} | null;

const ProspectsTable = ({ prospects, onUpdate }: ProspectsTableProps) => {
  const [editingProspect, setEditingProspect] = useState<Prospect | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const handleSort = (key: keyof Prospect) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return { key, direction: 'asc' };
    });
  };

  const sortedProspects = [...prospects].sort((a, b) => {
    if (!sortConfig) return 0;

    const { key, direction } = sortConfig;
    let aValue = a[key];
    let bValue = b[key];

    // Handle null values
    if (aValue === null) aValue = '';
    if (bValue === null) bValue = '';

    // Convert to numbers for numeric comparisons
    if (key === 'rating' || key === 'review_count') {
      aValue = Number(aValue) || 0;
      bValue = Number(bValue) || 0;
    }

    // Handle date comparisons
    if (key === 'last_contact') {
      aValue = new Date(aValue as string).getTime();
      bValue = new Date(bValue as string).getTime();
    }

    if (aValue < bValue) {
      return direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

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
          <ProspectTableHeader onSort={handleSort} sortConfig={sortConfig} />
          <TableBody>
            {sortedProspects.map((prospect) => (
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