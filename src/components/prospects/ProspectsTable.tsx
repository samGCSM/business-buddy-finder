import { Table, TableBody } from "@/components/ui/table";
import { useState, useEffect, useCallback } from "react";
import EditProspectForm from "./EditProspectForm";
import ProspectTableHeader from "./ProspectTableHeader";
import ProspectTableRow from "./ProspectTableRow";
import type { Prospect } from "@/types/prospects";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ProspectsTableProps {
  prospects: Prospect[];
  onUpdate: () => void;
  onSelectionChange?: (selectedIds: Set<string>) => void;
}

type SortConfig = {
  key: keyof Prospect;
  direction: 'asc' | 'desc';
} | null;

const ProspectsTable = ({ prospects, onUpdate, onSelectionChange }: ProspectsTableProps) => {
  const [editingProspect, setEditingProspect] = useState<Prospect | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Clear selection when prospects change
  useEffect(() => {
    setSelectedIds(new Set());
    onSelectionChange?.(new Set());
  }, [prospects.length]);

  const updateSelection = useCallback((newSet: Set<string>) => {
    setSelectedIds(newSet);
    onSelectionChange?.(newSet);
  }, [onSelectionChange]);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      onSelectionChange?.(next);
      return next;
    });
  }, [onSelectionChange]);

  const handleToggleAll = useCallback(() => {
    const allIds = sortedProspects.map(p => p.id);
    if (selectedIds.size === allIds.length) {
      updateSelection(new Set());
    } else {
      updateSelection(new Set(allIds));
    }
  }, [selectedIds, updateSelection]);

  const handleSort = (key: keyof Prospect) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const sortedProspects = [...prospects].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    let aValue = a[key];
    let bValue = b[key];
    if (aValue === null) aValue = '';
    if (bValue === null) bValue = '';
    if (key === 'rating' || key === 'review_count') {
      aValue = Number(aValue) || 0;
      bValue = Number(bValue) || 0;
    }
    if (key === 'last_contact') {
      aValue = new Date(aValue as string).getTime();
      bValue = new Date(bValue as string).getTime();
    }
    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('prospects').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Success", description: "Prospect deleted successfully" });
      onUpdate();
    } catch (error) {
      console.error('Error deleting prospect:', error);
      toast({ title: "Error", description: "Failed to delete prospect", variant: "destructive" });
    }
  };

  const allSelected = sortedProspects.length > 0 && selectedIds.size === sortedProspects.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {editingProspect && (
        <EditProspectForm
          prospect={editingProspect}
          onClose={() => setEditingProspect(null)}
          onSuccess={() => { setEditingProspect(null); onUpdate(); }}
        />
      )}
      <div className="overflow-x-auto">
        <Table>
          <ProspectTableHeader
            onSort={handleSort}
            sortConfig={sortConfig}
            allSelected={allSelected}
            someSelected={someSelected}
            onToggleAll={handleToggleAll}
          />
          <TableBody>
            {sortedProspects.map((prospect) => (
              <ProspectTableRow
                key={prospect.id}
                prospect={prospect}
                onEdit={setEditingProspect}
                onDelete={handleDelete}
                onUpdate={onUpdate}
                isSelected={selectedIds.has(prospect.id)}
                onToggleSelect={handleToggleSelect}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ProspectsTable;
