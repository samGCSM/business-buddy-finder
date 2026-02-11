
import type { Business } from "@/types/business";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface BusinessTableRowProps {
  business: Business;
  onDelete: (id: string) => void;
}

const BusinessTableRow = ({ business, onDelete }: BusinessTableRowProps) => {
  return (
    <tr key={business.id}>
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-900">{business.name}</div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-500">{business.website}</div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900">{business.email}</div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900">{business.phone}</div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900">{business.rating.toFixed(1)} ★</div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-500">{business.reviewCount} reviews</div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-500">
          {business.distance != null ? `${business.distance} mi` : '—'}
        </div>
      </td>
      <td className="px-6 py-4">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={() => onDelete(business.id)}
          title="Remove from results"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  );
};

export default BusinessTableRow;
