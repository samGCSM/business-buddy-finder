import { TableCell, TableRow } from "@/components/ui/table";
import type { Prospect } from "@/types/prospects";
import ProspectActions from "./table/ProspectActions";
import ProspectNotesCell from "./table/ProspectNotesCell";
import ProspectStatusCell from "./table/ProspectStatusCell";
import ProspectPriorityCell from "./table/ProspectPriorityCell";
import LastContactCell from "./LastContactCell";

interface ProspectTableRowProps {
  prospect: Prospect;
  onEdit: (prospect: Prospect) => void;
  onDelete: (id: string) => void;
  onUpdate: () => void;
}

const ProspectTableRow = ({ prospect, onEdit, onDelete, onUpdate }: ProspectTableRowProps) => {
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