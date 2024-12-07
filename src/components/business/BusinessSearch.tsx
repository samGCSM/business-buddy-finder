import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { searchBusinesses } from "@/utils/googleApi";
import type { Business } from "@/types/business";
import type { SavedSearch } from "@/services/savedSearchService";
import BusinessSearchForm from "./BusinessSearchForm";
import BusinessResultsTable from "./BusinessResultsTable";
import { Button } from "@/components/ui/button";

interface BusinessSearchProps {
  onShowSavedSearches: () => void;
  initialSearch?: SavedSearch | null;
}

const BusinessSearch = ({ onShowSavedSearches, initialSearch }: BusinessSearchProps) => {
  const [results, setResults] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("");
  const [currentKeyword, setCurrentKeyword] = useState("");

  useEffect(() => {
    if (initialSearch) {
      console.log('Loading initial search:', initialSearch);
      setResults(initialSearch.results);
      setCurrentLocation(initialSearch.location);
      setCurrentKeyword(initialSearch.keyword);
    }
  }, [initialSearch]);

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

      <BusinessSearchForm 
        onSearch={handleSearch} 
        isLoading={isLoading}
        initialLocation={currentLocation}
        initialKeyword={currentKeyword}
      />
      
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