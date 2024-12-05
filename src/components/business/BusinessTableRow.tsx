import type { Business } from "@/types/business";

interface BusinessTableRowProps {
  business: Business;
}

const BusinessTableRow = ({ business }: BusinessTableRowProps) => {
  return (
    <tr key={business.id}>
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-900">{business.name}</div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-500">{business.website}</div>
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
    </tr>
  );
};

export default BusinessTableRow;