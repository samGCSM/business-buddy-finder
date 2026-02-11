
import { TableCell } from "@/components/ui/table";
import type { Prospect } from "@/types/prospects";

interface BusinessNameCellProps {
  prospect: Prospect;
  onEdit: (prospect: Prospect) => void;
}

const BusinessNameCell = ({ prospect, onEdit }: BusinessNameCellProps) => {
  return (
    <TableCell className="font-medium whitespace-nowrap">
      <button 
        onClick={() => onEdit(prospect)}
        className="text-left hover:text-blue-600 hover:underline cursor-pointer w-full"
      >
        {prospect.business_name}
      </button>
    </TableCell>
  );
};

export default BusinessNameCell;
