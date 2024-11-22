import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

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

const BusinessResultsTable = ({ results }: BusinessResultsTableProps) => {
  const handleExport = () => {
    try {
      // Transform data for Excel
      const exportData = results.map(business => ({
        'Business Name': business.name,
        'Phone': business.phone,
        'Email': business.email,
        'Website': business.website,
        'Rating': business.rating,
        'Review Count': business.reviewCount,
        'Address': business.address
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Businesses");
      
      // Generate Excel file
      XLSX.writeFile(wb, "business_search_results.xlsx");

      toast({
        title: "Success",
        description: "Data exported successfully",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button type="button" variant="outline" onClick={handleExport}>
          Export to Excel
        </Button>
      </div>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Website</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Review Rating</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Number of Reviews</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.map((business) => (
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BusinessResultsTable;