import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Business Name</TableHead>
              <TableHead>Notes</TableHead>
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
                <TableCell>{prospect.business_name}</TableCell>
                <TableCell>{prospect.notes}</TableCell>
                <TableCell>{prospect.website}</TableCell>
                <TableCell>{prospect.email}</TableCell>
                <TableCell>{prospect.business_address}</TableCell>
                <TableCell>{prospect.phone_number}</TableCell>
                <TableCell>{prospect.owner_name}</TableCell>
                <TableCell>{prospect.status}</TableCell>
                <TableCell>{prospect.priority}</TableCell>
                <TableCell>{prospect.owner_phone}</TableCell>
                <TableCell>{prospect.owner_email}</TableCell>
                <TableCell>{new Date(prospect.last_contact).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(prospect.id)}
                  >
                    Delete
                  </Button>
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