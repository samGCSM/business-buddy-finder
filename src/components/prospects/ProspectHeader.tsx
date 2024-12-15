import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";
import BulkUploadProspects from "./BulkUploadProspects";

interface ProspectHeaderProps {
  onAddClick: () => void;
  onBulkUploadSuccess: () => void;
}

const ProspectHeader = ({ onAddClick, onBulkUploadSuccess }: ProspectHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Prospect Now</h2>
      <div className="space-x-4">
        <Button onClick={onAddClick} className="gap-2">
          <Plus className="h-4 w-4" />
          Add New Prospect
        </Button>
        <BulkUploadProspects onSuccess={onBulkUploadSuccess} />
      </div>
    </div>
  );
};

export default ProspectHeader;