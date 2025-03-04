
import { Button } from "@/components/ui/button";
import BulkUploadProspects from "./BulkUploadProspects";
import { PlusCircle, Download, MapPin } from "lucide-react";
import { generateSpreadsheet } from "@/utils/exportData";
import type { Prospect } from "@/types/prospects";
import TerritoryManager from "./TerritoryManager";
import { useNavigate } from "react-router-dom";

interface ProspectHeaderProps {
  onAddClick: () => void;
  onBulkUploadSuccess: () => void;
  prospects: Prospect[];
  showAddButton?: boolean;
  userId?: number;
}

const ProspectHeader = ({ 
  onAddClick, 
  onBulkUploadSuccess, 
  prospects,
  showAddButton = true,
  userId
}: ProspectHeaderProps) => {
  const navigate = useNavigate();
  const handleExport = () => {
    generateSpreadsheet(prospects);
  };

  const handleMapView = () => {
    navigate('/prospects/map', { state: { prospects } });
  };

  const mappableProspects = prospects.filter(p => p.business_address);
  const mappableCount = mappableProspects.length;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className="flex items-center gap-4">
        {showAddButton && (
          <Button onClick={onAddClick} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Prospect
          </Button>
        )}
        {userId && <TerritoryManager userId={userId} />}
      </div>
      <div className="flex items-center gap-4">
        <BulkUploadProspects onSuccess={onBulkUploadSuccess} />
        <Button variant="outline" onClick={handleMapView} className="gap-2" title={`Map ${mappableCount} prospects with addresses`}>
          <MapPin className="h-4 w-4" />
          Map These ({mappableCount})
        </Button>
        <Button variant="outline" onClick={handleExport} className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>
    </div>
  );
};

export default ProspectHeader;
