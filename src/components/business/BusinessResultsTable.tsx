import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface Business {
  id: string;
  name: string;
  phone: string;
  email: string;
  website: string;
  reviewCount: number;
  rating: number;
  address: string;
}

interface BusinessResultsTableProps {
  results: Business[];
  onExport: () => void;
}

const BusinessResultsTable = ({ results, onExport }: BusinessResultsTableProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button type="button" variant="outline" onClick={onExport}>
          Export to Excel
        </Button>
      </div>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reviews</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.map((business) => (
              <tr key={business.id}>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{business.name}</div>
                  <div className="text-sm text-gray-500">{business.website}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{business.phone}</div>
                  <div className="text-sm text-gray-500">{business.email}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{business.rating.toFixed(1)} ★</div>
                  <div className="text-sm text-gray-500">{business.reviewCount} reviews</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{business.address}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BusinessResultsTable;