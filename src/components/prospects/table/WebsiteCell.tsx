
import { TableCell } from "@/components/ui/table";

interface WebsiteCellProps {
  website: string | null;
}

const WebsiteCell = ({ website }: WebsiteCellProps) => {
  return (
    <TableCell className="max-w-[250px]">
      {website ? (
        <a 
          href={website.startsWith('http') ? website : `https://${website}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 hover:underline truncate block"
          title={website}
        >
          {website}
        </a>
      ) : null}
    </TableCell>
  );
};

export default WebsiteCell;
