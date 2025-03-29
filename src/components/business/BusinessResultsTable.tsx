
import * as XLSX from 'xlsx';
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import type { Business } from "@/types/business";
import BusinessTableActions from "./BusinessTableActions";
import BusinessTableHeader from "./BusinessTableHeader";
import BusinessTableRow from "./BusinessTableRow";

interface BusinessResultsTableProps {
  results: Business[];
  location: string;
  keyword: string;
  radius?: number; // Ensure radius is in the props
  onResultsChange?: (results: Business[]) => void;
}

const BusinessResultsTable = ({ 
  results, 
  location, 
  keyword,
  radius = 10, // Default radius if not provided
  onResultsChange 
}: BusinessResultsTableProps) => {
  const [currentResults, setCurrentResults] = useState<Business[]>(results);
  
  // Synchronize internal state with incoming props
  useEffect(() => {
    console.log('BusinessResultsTable received new results:', results.length);
    setCurrentResults(results);
  }, [results]);

  const handleExport = () => {
    try {
      const exportData = currentResults.map(business => ({
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

  const handleDeleteBusiness = (id: string) => {
    const updatedResults = currentResults.filter(business => business.id !== id);
    setCurrentResults(updatedResults);
    
    if (onResultsChange) {
      onResultsChange(updatedResults);
    }
    
    toast({
      title: "Business removed",
      description: "The business has been removed from your results",
    });
  };

  return (
    <div className="space-y-4">
      <BusinessTableActions 
        results={currentResults}
        location={location}
        keyword={keyword}
        radius={radius}
        onExport={handleExport}
      />
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <BusinessTableHeader showDeleteColumn={true} />
          <tbody className="bg-white divide-y divide-gray-200">
            {currentResults.map((business) => (
              <BusinessTableRow 
                key={business.id} 
                business={business} 
                onDelete={handleDeleteBusiness}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BusinessResultsTable;
