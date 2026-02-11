
import { Button } from "@/components/ui/button";
import BulkUploadProspects from "./BulkUploadProspects";
import { PlusCircle, Download, MapPin, Trash2, Zap, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateSpreadsheet } from "@/utils/exportData";
import type { Prospect } from "@/types/prospects";
import type { User } from "@/types/user";
import TerritoryManager from "./TerritoryManager";
import UserProspectFilter from "./UserProspectFilter";
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
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  selectedTerritory?: string;
  onTerritoryChange?: (territory: string) => void;
  territories?: string[];
  userRole?: 'admin' | 'supervisor' | 'user' | null;
  supervisedUsers?: User[];
  currentUser?: User | null;
  onUserSelect?: (userId: number) => void;
}

const ProspectHeader = ({ 
  onAddClick, 
  onBulkUploadSuccess, 
  prospects,
  selectedProspects,
  showAddButton = true,
  userId,
  searchQuery = "",
  onSearchChange,
  selectedTerritory = "all",
  onTerritoryChange,
  territories = [],
  userRole,
  supervisedUsers = [],
  currentUser,
  onUserSelect
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
  const enrichableCount = actionProspects.filter(p => (!p.email || p.email.toLowerCase() === 'n/a') && ((p.website && p.website.toLowerCase() !== 'n/a') || p.business_name)).length;

  return (
    <div className="space-y-4 mb-6">
      {/* Row 1: Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        {(userRole === 'admin' || userRole === 'supervisor') && supervisedUsers.length > 0 && (
          <UserProspectFilter 
            users={supervisedUsers}
            onUserSelect={onUserSelect}
            currentUser={currentUser ?? null}
          />
        )}
        <Select value={selectedTerritory} onValueChange={(v) => onTerritoryChange?.(v)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by Territory" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Territories</SelectItem>
            {territories.map((territory) => (
              <SelectItem key={territory} value={territory}>
                {territory}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Row 2: Actions + Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          {showAddButton && (
            <Button onClick={onAddClick} className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Add Prospect
            </Button>
          )}
          {userId && <TerritoryManager userId={userId} />}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search prospects..."
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-8 w-[220px]"
            />
          </div>
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
              : hasSelection
                ? `Enrich (${enrichableCount})`
                : `Enrich All${enrichableCount > 0 ? ` (${enrichableCount})` : ''}`
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
    </div>
  );
};

export default ProspectHeader;
