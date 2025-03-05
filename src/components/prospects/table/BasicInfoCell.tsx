
import { TableCell } from "@/components/ui/table";

interface BasicInfoCellProps {
  value: string | number | null;
}

const BasicInfoCell = ({ value }: BasicInfoCellProps) => {
  return (
    <TableCell>{value || ''}</TableCell>
  );
};

export default BasicInfoCell;
