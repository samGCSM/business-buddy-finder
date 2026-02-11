
import { TableCell } from "@/components/ui/table";

interface BasicInfoCellProps {
  value: string | number | null;
}

const BasicInfoCell = ({ value }: BasicInfoCellProps) => {
  return (
    <TableCell>
      <span className="block truncate max-w-[180px]">{value || ''}</span>
    </TableCell>
  );
};

export default BasicInfoCell;
