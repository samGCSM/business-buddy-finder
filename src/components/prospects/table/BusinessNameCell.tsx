
import { TableCell } from "@/components/ui/table";
import type { Prospect } from "@/types/prospects";

interface BusinessNameCellProps {
  prospect: Prospect;
  onEdit: (prospect: Prospect) => void;
}

const BusinessNameCell = ({ prospect, onEdit }: BusinessNameCellProps) => {
  return (
    <TableCell className="sticky left-0 bg-white font-medium whitespace-nowrap z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
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
