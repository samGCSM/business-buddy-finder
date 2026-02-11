
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { searchBusinesses } from "@/utils/googleApi";
import { supabase } from "@/integrations/supabase/client";
import type { Business } from "@/types/business";
import type { SavedSearch } from "@/services/savedSearchService";
import BusinessSearchForm from "./BusinessSearchForm";
import BusinessResultsTable from "./BusinessResultsTable";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface BusinessSearchProps {
  onShowSavedSearches: () => void;
  initialSearch?: SavedSearch | null;
}

const extractDomain = (url: string): string | null => {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
};

const BusinessSearch = ({ onShowSavedSearches, initialSearch }: BusinessSearchProps) => {
  const [results, setResults] = useState<Business[]>([]);
  const [allResults, setAllResults] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnrichingEmails, setIsEnrichingEmails] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("");
  const [currentKeyword, setCurrentKeyword] = useState("");
  const [currentRadius, setCurrentRadius] = useState(10);

  useEffect(() => {
    if (initialSearch) {
      console.log('Loading initial search:', initialSearch);
      setResults(initialSearch.results.slice(0, 20));
      setAllResults(initialSearch.results);
      setCurrentLocation(initialSearch.location);
      setCurrentKeyword(initialSearch.keyword);
      setCurrentRadius(initialSearch.radius || 10);
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

  const enrichEmails = async (businesses: Business[]): Promise<void> => {
    setIsEnrichingEmails(true);
    const CONCURRENCY = 3;
    const queue = businesses
      .map((b, i) => ({ index: i, domain: b.website !== 'N/A' ? extractDomain(b.website) : null }))
      .filter(item => item.domain !== null);

    const process = async (item: { index: number; domain: string | null }) => {
      if (!item.domain) return;
      try {
        const { data, error } = await supabase.functions.invoke('enrich-prospect-email', {
          body: { domain: item.domain },
        });
        if (error) return;
        const email = data?.data?.emails?.[0]?.value;
        if (email) {
          setResults(prev => prev.map((b, i) => i === item.index ? { ...b, email } : b));
          setAllResults(prev => prev.map((b, i) => i === item.index ? { ...b, email } : b));
        }
      } catch {
        // silently skip failures
      }
    };

    // Process in batches
    for (let i = 0; i < queue.length; i += CONCURRENCY) {
      await Promise.all(queue.slice(i, i + CONCURRENCY).map(process));
    }
    setIsEnrichingEmails(false);
  };

  const handleSearch = async (location: string, keyword: string, radius: number) => {
    setIsLoading(true);
    setCurrentLocation(location);
    setCurrentKeyword(keyword);
    setCurrentRadius(radius);
    
    try {
      const businesses = await searchBusinesses(location, keyword, radius);
      setAllResults(businesses);
      setResults(businesses.slice(0, 20));

      const currentUserStr = localStorage.getItem('currentUser');
      if (currentUserStr) {
        const currentUser = JSON.parse(currentUserStr);
        if (currentUser && currentUser.id) {
          await updateSearchCount(currentUser.id);
        }
      }

      // Start email enrichment in background
      enrichEmails(businesses);
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
    if (results.length >= allResults.length) {
      toast({ title: "Info", description: "No more results to load" });
      return;
    }
    
    const nextBatch = allResults.slice(results.length, results.length + 20);
    if (nextBatch.length > 0) {
      setResults(prev => [...prev, ...nextBatch]);
      toast({ title: "Success", description: `Loaded ${nextBatch.length} more results` });
    }
  };

  const handleResultsChange = (updatedResults: Business[]) => {
    setResults(updatedResults);
  };

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
        initialRadius={currentRadius}
      />

      {isEnrichingEmails && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Enriching emails...
        </div>
      )}
      
      {results.length > 0 && (
        <div className="space-y-4">
          <BusinessResultsTable 
            results={results}
            location={currentLocation}
            keyword={currentKeyword}
            radius={currentRadius}
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
