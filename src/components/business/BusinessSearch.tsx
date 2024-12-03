import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { searchBusinesses } from "@/utils/googleApi";
import type { Business } from "@/types/business";
import BusinessSearchForm from "./BusinessSearchForm";
import BusinessResultsTable from "./BusinessResultsTable";
import { Button } from "@/components/ui/button";

interface BusinessSearchProps {
  onShowSavedSearches: () => void;
}

const BusinessSearch = ({ onShowSavedSearches }: BusinessSearchProps) => {
  const [results, setResults] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("");
  const [currentKeyword, setCurrentKeyword] = useState("");

  const handleSearch = async (location: string, keyword: string) => {
    setIsLoading(true);
    setCurrentLocation(location);
    setCurrentKeyword(keyword);
    
    try {
      console.log('Searching businesses:', { location, keyword });
      const businesses = await searchBusinesses(location, keyword);
      console.log('Search results:', businesses);
      setResults(businesses);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch results. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Business Search</h2>
        <Button variant="outline" onClick={onShowSavedSearches}>
          Past Searches
        </Button>
      </div>

      <BusinessSearchForm onSearch={handleSearch} isLoading={isLoading} />
      
      {results.length > 0 && (
        <BusinessResultsTable 
          results={results}
          location={currentLocation}
          keyword={currentKeyword}
        />
      )}
    </div>
  );
};

export default BusinessSearch;