import { Button } from "@/components/ui/button";
import { Plus, Upload, Download } from "lucide-react";
import BulkUploadProspects from "./BulkUploadProspects";
import * as XLSX from 'xlsx';
import { toast } from "@/hooks/use-toast";

interface ProspectHeaderProps {
  onAddClick: () => void;
  onBulkUploadSuccess: () => void;
  prospects: any[];
}

const ProspectHeader = ({ onAddClick, onBulkUploadSuccess, prospects }: ProspectHeaderProps) => {
  const handleExport = () => {
    try {
      const exportData = prospects.map(prospect => ({
        'Business Name': prospect.business_name,
        'Website': prospect.website,
        'Email': prospect.email,
        'Address': prospect.business_address,
        'Phone': prospect.phone_number,
        'Owner Name': prospect.owner_name,
        'Status': prospect.status,
        'Priority': prospect.priority,
        'Owner Phone': prospect.owner_phone,
        'Owner Email': prospect.owner_email,
        'Last Contact': new Date(prospect.last_contact).toLocaleDateString(),
        'Notes': prospect.notes
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Prospects");
      XLSX.writeFile(wb, "prospects.xlsx");

      toast({
        title: "Success",
        description: "Prospects exported successfully",
      });
    } catch (error) {
      console.error('Error exporting prospects:', error);
      toast({
        title: "Error",
        description: "Failed to export prospects",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Prospect Now</h2>
      <div className="space-x-4">
        <Button onClick={onAddClick} className="gap-2">
          <Plus className="h-4 w-4" />
          Add New Prospect
        </Button>
        <BulkUploadProspects onSuccess={onBulkUploadSuccess} />
        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export to Excel
        </Button>
      </div>
    </div>
  );
};

export default ProspectHeader;