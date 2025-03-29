
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { searchBusinesses } from "@/utils/googleApi";
import { supabase } from "@/integrations/supabase/client";
import type { Business } from "@/types/business";
import type { SavedSearch } from "@/services/savedSearchService";
import BusinessSearchForm from "./BusinessSearchForm";
import BusinessResultsTable from "./BusinessResultsTable";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BusinessSearchProps {
  onShowSavedSearches: () => void;
  initialSearch?: SavedSearch | null;
}

const BusinessSearch = ({ onShowSavedSearches, initialSearch }: BusinessSearchProps) => {
  const [results, setResults] = useState<Business[]>([]);
  const [allResults, setAllResults] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("");
  const [currentKeyword, setCurrentKeyword] = useState("");

  useEffect(() => {
    if (initialSearch) {
      console.log('Loading initial search:', initialSearch);
      setResults(initialSearch.results.slice(0, 20));
      setAllResults(initialSearch.results);
      setCurrentLocation(initialSearch.location);
      setCurrentKeyword(initialSearch.keyword);
    }
  }, [initialSearch]);

  const updateSearchCount = async (userId: number) => {
    console.log('Updating search count for user:', userId);
    
    try {
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('totalSearches')
        .eq('id', userId)
        .single();

      if (fetchError) {
        console.error('Error fetching user data:', fetchError);
        return;
      }

      const currentSearches = (userData?.totalSearches || 0) + 1;
      console.log('New search count:', currentSearches);

      const { error: updateError } = await supabase
        .from('users')
        .update({ totalSearches: currentSearches })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating search count:', updateError);
      }
    } catch (error) {
      console.error('Error in updateSearchCount:', error);
    }
  };

  const handleSearch = async (location: string, keyword: string) => {
    setIsLoading(true);
    setCurrentLocation(location);
    setCurrentKeyword(keyword);
    
    try {
      console.log('Searching businesses:', { location, keyword });
      const businesses = await searchBusinesses(location, keyword);
      console.log('Search results:', businesses);
      setAllResults(businesses); // Store all results
      setResults(businesses.slice(0, 20)); // Display first 20

      // Get the current user from localStorage
      const currentUserStr = localStorage.getItem('currentUser');
      if (currentUserStr) {
        const currentUser = JSON.parse(currentUserStr);
        if (currentUser && currentUser.id) {
          await updateSearchCount(currentUser.id);
        }
      }
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

  const handleLoadMore = () => {
    console.log('Load more clicked');
    
    if (results.length >= allResults.length) {
      console.log('No more results to load');
      toast({
        title: "Info",
        description: "No more results to load",
      });
      return;
    }
    
    const currentLength = results.length;
    console.log('Current results length:', currentLength);
    console.log('All results length:', allResults.length);
    
    const nextBatch = allResults.slice(currentLength, currentLength + 20);
    console.log('Next batch length:', nextBatch.length);
    
    if (nextBatch.length > 0) {
      // Create a completely new array for React to detect the change
      const newResults = [...results, ...nextBatch];
      console.log('Setting updated results with length:', newResults.length);
      
      // Force a complete re-render by creating a new state
      setResults(newResults);
      
      // Add a confirmation toast
      toast({
        title: "Success",
        description: `Loaded ${nextBatch.length} more results`,
      });
    }
  };

  const handleResultsChange = (updatedResults: Business[]) => {
    console.log('Results changed by child component, new length:', updatedResults.length);
    setResults(updatedResults);
  };

  // Only show load more if there are more results to load
  const showLoadMore = results.length < allResults.length;

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
        <div className="space-y-4">
          <BusinessResultsTable 
            results={results}
            location={currentLocation}
            keyword={currentKeyword}
            onResultsChange={handleResultsChange}
          />
          
          {showLoadMore && (
            <div className="flex justify-center mt-4 pb-4">
              <Button 
                onClick={handleLoadMore} 
                disabled={isLoading}
                className="w-full md:w-auto"
                variant="default"
                size="lg"
              >
                Load More Results ({results.length}/{allResults.length})
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BusinessSearch;
