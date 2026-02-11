
import { Button } from "@/components/ui/button";
import BulkUploadProspects from "./BulkUploadProspects";
import { PlusCircle, Download, MapPin, Trash2, Zap } from "lucide-react";
import { generateSpreadsheet } from "@/utils/exportData";
import type { Prospect } from "@/types/prospects";
import TerritoryManager from "./TerritoryManager";
import { useNavigate } from "react-router-dom";
import { useBulkEmailEnrichment } from "@/hooks/useBulkEmailEnrichment";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ProspectHeaderProps {
  onAddClick: () => void;
  onBulkUploadSuccess: () => void;
  prospects: Prospect[];
  selectedProspects: Prospect[];
  showAddButton?: boolean;
  userId?: number;
}

const ProspectHeader = ({ 
  onAddClick, 
  onBulkUploadSuccess, 
  prospects,
  selectedProspects,
  showAddButton = true,
  userId
}: ProspectHeaderProps) => {
  const navigate = useNavigate();
  const { isEnriching, progress, enrichProspects } = useBulkEmailEnrichment();

  const hasSelection = selectedProspects.length > 0;
  const actionProspects = hasSelection ? selectedProspects : prospects;

  const handleExport = () => {
    generateSpreadsheet(actionProspects);
  };

  const handleMapView = () => {
    const mappable = actionProspects.filter(p => p.business_address);
    navigate('/prospects/map', { state: { prospects: mappable } });
  };

  const handleDeleteSelected = async () => {
    if (!hasSelection) return;
    const confirmed = window.confirm(`Delete ${selectedProspects.length} selected prospect(s)?`);
    if (!confirmed) return;

    try {
      const ids = selectedProspects.map(p => p.id);
      const { error } = await supabase
        .from('prospects')
        .delete()
        .in('id', ids);
      if (error) throw error;
      toast({ title: "Success", description: `Deleted ${ids.length} prospect(s)` });
      onBulkUploadSuccess();
    } catch (error) {
      console.error('Error deleting prospects:', error);
      toast({ title: "Error", description: "Failed to delete prospects", variant: "destructive" });
    }
  };

  const handleBulkEnrich = () => {
    enrichProspects(actionProspects, onBulkUploadSuccess);
  };

  const mappableCount = actionProspects.filter(p => p.business_address).length;
  const enrichableCount = actionProspects.filter(p => !p.email && (p.website || p.business_name)).length;

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
      <div className="flex items-center gap-2 flex-wrap">
        <BulkUploadProspects onSuccess={onBulkUploadSuccess} />

        <Button
          variant="outline"
          onClick={handleBulkEnrich}
          className="gap-2"
          disabled={isEnriching || enrichableCount === 0}
        >
          <Zap className="h-4 w-4" />
          {isEnriching
            ? `Enriching ${progress.current}/${progress.total}...`
            : `Enrich Emails${enrichableCount > 0 ? ` (${enrichableCount})` : ''}`
          }
        </Button>

        {hasSelection && (
          <Button variant="destructive" onClick={handleDeleteSelected} className="gap-2">
            <Trash2 className="h-4 w-4" />
            Delete ({selectedProspects.length})
          </Button>
        )}

        <Button variant="outline" onClick={handleMapView} className="gap-2">
          <MapPin className="h-4 w-4" />
          {hasSelection ? `Map (${mappableCount})` : `Map These (${mappableCount})`}
        </Button>

        <Button variant="outline" onClick={handleExport} className="gap-2">
          <Download className="h-4 w-4" />
          {hasSelection ? `Export (${selectedProspects.length})` : 'Export All'}
        </Button>
      </div>
    </div>
  );
};

export default ProspectHeader;
