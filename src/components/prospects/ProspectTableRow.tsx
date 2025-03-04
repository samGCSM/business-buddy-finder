import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";
import type { Prospect } from "@/types/prospects";
import ProspectActions from "./table/ProspectActions";
import ProspectNotesCell from "./table/ProspectNotesCell";
import ProspectStatusCell from "./table/ProspectStatusCell";
import ProspectPriorityCell from "./table/ProspectPriorityCell";
import LastContactCell from "./LastContactCell";
import CompanyInsightsDrawer from "./ai-insights/CompanyInsightsDrawer";
import { useState, useEffect } from "react";
import { useTerritories } from "@/hooks/useTerritories";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCurrentUser } from "@/services/userService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import ProspectEmailCell from "./table/ProspectEmailCell";

interface ProspectTableRowProps {
  prospect: Prospect;
  onEdit: (prospect: Prospect) => void;
  onDelete: (id: string) => void;
  onUpdate: () => void;
}

const ProspectTableRow = ({ prospect, onEdit, onDelete, onUpdate }: ProspectTableRowProps) => {
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const { territories, fetchTerritories } = useTerritories();
  const [currentTerritory, setCurrentTerritory] = useState(prospect.territory || "");
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const initializeUser = async () => {
      const user = await getCurrentUser();
      if (user) {
        setUserId(user.id);
        setUserRole(user.type);
        // If admin, fetch territories for the prospect's user_id instead of the admin's id
        if (user.type === 'admin') {
          await fetchTerritories(prospect.user_id);
        } else {
          await fetchTerritories(user.id);
        }
      }
    };
    initializeUser();
  }, [fetchTerritories, prospect.user_id]);

  useEffect(() => {
    setCurrentTerritory(prospect.territory || "");
  }, [prospect.territory]);

  const handleTerritoryChange = async (value: string) => {
    try {
      setCurrentTerritory(value);
      const { error } = await supabase
        .from('prospects')
        .update({ territory: value })
        .eq('id', prospect.id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Territory updated successfully",
      });
      
      onUpdate();
    } catch (error) {
      console.error('Error updating territory:', error);
      setCurrentTerritory(prospect.territory || ""); // Reset on error
      toast({
        title: "Error",
        description: "Failed to update territory",
        variant: "destructive",
      });
    }
  };

  const getGoogleMapsUrl = (address: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  return (
    <TableRow key={prospect.id}>
      <TableCell className="sticky left-0 bg-white font-medium whitespace-nowrap">
        {prospect.business_name}
      </TableCell>
      <ProspectNotesCell
        prospectId={prospect.id}
        notes={prospect.notes}
        activityLog={prospect.activity_log}
        onUpdate={onUpdate}
      />
      <TableCell>
        <Select
          value={currentTerritory}
          onValueChange={handleTerritoryChange}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select a territory">
              {currentTerritory || "Select a territory"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {territories.map((territory) => (
              <SelectItem 
                key={territory.id} 
                value={territory.name}
                disabled={!territory.active}
              >
                {territory.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="max-w-[250px]">
        {prospect.website ? (
          <a 
            href={prospect.website.startsWith('http') ? prospect.website : `https://${prospect.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 hover:underline truncate block"
            title={prospect.website}
          >
            {prospect.website}
          </a>
        ) : null}
      </TableCell>
      <ProspectEmailCell prospect={prospect} onUpdate={onUpdate} />
      <TableCell>{prospect.email}</TableCell>
      <TableCell>
        {prospect.business_address ? (
          <a
            href={getGoogleMapsUrl(prospect.business_address)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            {prospect.business_address}
          </a>
        ) : null}
      </TableCell>
      <TableCell>{prospect.location_type || 'Business'}</TableCell>
      <TableCell>{prospect.phone_number}</TableCell>
      <TableCell>{prospect.rating || '0.0'}</TableCell>
      <TableCell>{prospect.review_count || '0'}</TableCell>
      <ProspectStatusCell
        prospectId={prospect.id}
        status={prospect.status}
        onUpdate={onUpdate}
      />
      <ProspectPriorityCell
        prospectId={prospect.id}
        priority={prospect.priority}
        onUpdate={onUpdate}
      />
      <TableCell>{prospect.owner_name}</TableCell>
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
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsInsightsOpen(true)}
          className="hover:bg-accent"
        >
          <Brain className="h-4 w-4" />
        </Button>
        <CompanyInsightsDrawer
          isOpen={isInsightsOpen}
          onClose={() => setIsInsightsOpen(false)}
          prospectId={prospect.id}
          businessName={prospect.business_name}
          website={prospect.website || ''}
          onInsightGenerated={onUpdate}
        />
      </TableCell>
      <TableCell>
        <ProspectActions
          prospect={prospect}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </TableCell>
    </TableRow>
  );
};

export default ProspectTableRow;
