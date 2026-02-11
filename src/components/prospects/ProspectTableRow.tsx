
import { TableRow, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import type { Prospect } from "@/types/prospects";
import { useState, useEffect } from "react";
import { useTerritories } from "@/hooks/useTerritories";
import { getCurrentUser } from "@/services/userService";

// Import the new components
import ProspectActions from "./table/ProspectActions";
import ProspectNotesCell from "./table/ProspectNotesCell";
import ProspectStatusCell from "./table/ProspectStatusCell";
import ProspectPriorityCell from "./table/ProspectPriorityCell";
import ProspectEmailCell from "./table/ProspectEmailCell";
import LastContactCell from "./LastContactCell";
import BusinessNameCell from "./table/BusinessNameCell";
import WebsiteCell from "./table/WebsiteCell";
import AddressCell from "./table/AddressCell";
import TerritorySelectCell from "./table/TerritorySelectCell";
import BasicInfoCell from "./table/BasicInfoCell";

interface ProspectTableRowProps {
  prospect: Prospect;
  onEdit: (prospect: Prospect) => void;
  onDelete: (id: string) => void;
  onUpdate: () => void;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}

const ProspectTableRow = ({ prospect, onEdit, onDelete, onUpdate, isSelected, onToggleSelect }: ProspectTableRowProps) => {
  const [userId, setUserId] = useState<number | null>(null);
  const { territories, fetchTerritories } = useTerritories();
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

  return (
    <TableRow key={prospect.id}>
      <TableCell className="w-[40px] min-w-[40px]">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect(prospect.id)}
        />
      </TableCell>
      <BusinessNameCell prospect={prospect} onEdit={onEdit} />
      <ProspectNotesCell
        prospectId={prospect.id}
        notes={prospect.notes}
        activityLog={prospect.activity_log}
        onUpdate={onUpdate}
      />
      <TerritorySelectCell
        prospectId={prospect.id}
        territory={prospect.territory}
        territories={territories}
        onUpdate={onUpdate}
      />
      <WebsiteCell website={prospect.website} />
      <ProspectEmailCell prospect={prospect} onUpdate={onUpdate} />
      <AddressCell address={prospect.business_address} />
      <BasicInfoCell value={prospect.location_type || 'Business'} />
      <BasicInfoCell value={prospect.phone_number} />
      <BasicInfoCell value={prospect.rating || '0.0'} />
      <BasicInfoCell value={prospect.review_count || '0'} />
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
      <BasicInfoCell value={prospect.owner_name} />
      <BasicInfoCell value={prospect.owner_phone} />
      <BasicInfoCell value={prospect.owner_email} />
      <TableCell>
        <LastContactCell
          prospectId={prospect.id}
          prospectName={prospect.business_name}
          lastContact={prospect.last_contact}
          onUpdate={onUpdate}
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
