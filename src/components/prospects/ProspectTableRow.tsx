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
import { useState } from "react";

interface ProspectTableRowProps {
  prospect: Prospect;
  onEdit: (prospect: Prospect) => void;
  onDelete: (id: string) => void;
  onUpdate: () => void;
}

const ProspectTableRow = ({ prospect, onEdit, onDelete, onUpdate }: ProspectTableRowProps) => {
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);

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
      <TableCell>{prospect.territory || '-'}</TableCell>
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