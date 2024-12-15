import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Pencil } from "lucide-react";
import { useState } from "react";
import ProspectNotes from "./ProspectNotes";
import EditProspectForm from "./EditProspectForm";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";
import LastContactCell from "./LastContactCell";

interface Prospect {
  id: string;
  business_name: string;
  notes: string;
  website: string;
  email: string;
  business_address: string;
  phone_number: string;
  owner_name: string;
  status: string;
  priority: string;
  owner_phone: string;
  owner_email: string;
  last_contact: string;
}

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

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('prospects')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
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

  const handlePriorityChange = async (id: string, newPriority: string) => {
    try {
      const { error } = await supabase
        .from('prospects')
        .update({ priority: newPriority })
        .eq('id', id);

      if (error) throw error;
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
          <TableHeader className="sticky top-0 bg-white z-10">
            <TableRow>
              <TableHead className="w-[200px] min-w-[200px] sticky left-0 bg-white z-20">Business Name</TableHead>
              <TableHead className="min-w-[100px]">Notes</TableHead>
              <TableHead>Website</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Owner Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Owner Phone</TableHead>
              <TableHead>Owner Email</TableHead>
              <TableHead>Last Contact</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prospects.map((prospect) => (
              <TableRow key={prospect.id}>
                <TableCell className="sticky left-0 bg-white font-medium whitespace-nowrap">
                  {prospect.business_name}
                </TableCell>
                <TableCell>
                  <ProspectNotes
                    prospectId={prospect.id}
                    existingNotes={prospect.notes}
                    onNotesUpdated={onUpdate}
                  />
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
                    onStatusChange={(newStatus) => handleStatusChange(prospect.id, newStatus)}
                  />
                </TableCell>
                <TableCell>
                  <PriorityBadge
                    priority={prospect.priority}
                    onPriorityChange={(newPriority) => handlePriorityChange(prospect.id, newPriority)}
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
                      onClick={() => setEditingProspect(prospect)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(prospect.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ProspectsTable;