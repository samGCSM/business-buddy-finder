import * as XLSX from 'xlsx';
import { toast } from "@/hooks/use-toast";
import type { Business } from "@/types/business";
import BusinessTableActions from "./BusinessTableActions";
import BusinessTableHeader from "./BusinessTableHeader";
import BusinessTableRow from "./BusinessTableRow";

interface BusinessResultsTableProps {
  results: Business[];
  location: string;
  keyword: string;
}

const BusinessResultsTable = ({ results, location, keyword }: BusinessResultsTableProps) => {
  const handleExport = () => {
    try {
      const exportData = results.map(business => ({
        'Business Name': business.name,
        'Phone': business.phone,
        'Email': business.email,
        'Website': business.website,
        'Rating': business.rating,
        'Review Count': business.reviewCount,
        'Address': business.address
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Businesses");
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
      <BusinessTableActions 
        results={results}
        location={location}
        keyword={keyword}
        onExport={handleExport}
      />
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <BusinessTableHeader />
          <tbody className="bg-white divide-y divide-gray-200">
            {results.map((business) => (
              <BusinessTableRow key={business.id} business={business} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BusinessResultsTable;