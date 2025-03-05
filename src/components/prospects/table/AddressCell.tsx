
import { TableCell } from "@/components/ui/table";

interface AddressCellProps {
  address: string | null;
}

const AddressCell = ({ address }: AddressCellProps) => {
  const getGoogleMapsUrl = (address: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  return (
    <TableCell>
      {address ? (
        <a
          href={getGoogleMapsUrl(address)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 hover:underline"
        >
          {address}
        </a>
      ) : null}
    </TableCell>
  );
};

export default AddressCell;
