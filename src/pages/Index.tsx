import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";
import BusinessSearchForm from "@/components/business/BusinessSearchForm";
import BusinessResultsTable from "@/components/business/BusinessResultsTable";
import SavedSearchesList from "@/components/business/SavedSearchesList";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { searchBusinesses } from "@/utils/googleApi";
import { getCurrentUser, updateUserStats } from "@/services/userService";
import type { Business } from "@/types/business";

interface SavedSearch {
  id: string;
  date: string;
  location: string;
  keyword: string;
  results: Business[];
}

const SAVED_SEARCHES_KEY = 'savedSearches';

const Index = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [results, setResults] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [currentLocation, setCurrentLocation] = useState("");
  const [currentKeyword, setCurrentKeyword] = useState("");

  useEffect(() => {
    const loadSavedSearches = () => {
      const currentUser = getCurrentUser();
      if (currentUser) {
        const userSearchesKey = `${SAVED_SEARCHES_KEY}_${currentUser.id}`;
        const loadedSearches = localStorage.getItem(userSearchesKey);
        if (loadedSearches) {
          setSavedSearches(JSON.parse(loadedSearches));
        }
      }
    };
    loadSavedSearches();
  }, []);

  const handleSearch = async (location: string, keyword: string) => {
    setIsLoading(true);
    setCurrentLocation(location);
    setCurrentKeyword(keyword);
    try {
      const businesses = await searchBusinesses(location, keyword);
      setResults(businesses);
      setShowSavedSearches(false);
      
      // Update user's total searches count
      const currentUser = getCurrentUser();
      if (currentUser) {
        updateUserStats(currentUser.id, 'search');
        console.log('Updated search count for user:', currentUser.id);
      }
      
      toast({
        title: "Success",
        description: "Search completed successfully",
      });
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

  const handleSaveSearch = () => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      toast({
        title: "Error",
        description: "User not found",
        variant: "destructive",
      });
      return;
    }

    const newSavedSearch: SavedSearch = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      location: currentLocation,
      keyword: currentKeyword,
      results: results,
    };

    const updatedSearches = [...savedSearches, newSavedSearch];
    setSavedSearches(updatedSearches);
    
    // Save to localStorage with user-specific key
    const userSearchesKey = `${SAVED_SEARCHES_KEY}_${currentUser.id}`;
    localStorage.setItem(userSearchesKey, JSON.stringify(updatedSearches));
    
    // Update user's saved searches count
    updateUserStats(currentUser.id, 'savedSearch');
    console.log('Updated saved searches count for user:', currentUser.id);
    
    toast({
      title: "Success",
      description: "Search saved successfully",
    });
  };

  const handleLoadSavedSearch = (search: SavedSearch) => {
    setResults(search.results);
    setShowSavedSearches(false);
    toast({
      title: "Success",
      description: "Saved search loaded successfully",
    });
  };

  const handleExport = () => {
    toast({
      title: "Coming Soon",
      description: "Export functionality will be implemented soon",
    });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    setResults([]);
    setShowSavedSearches(false);
    toast({
      title: "Success",
      description: "Logged out successfully",
    });
  };

  const handleLogin = (isLoggedIn: boolean, userType: 'admin' | 'user') => {
    setIsLoggedIn(isLoggedIn);
    setIsAdmin(userType === 'admin');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {!isLoggedIn ? (
          <LoginForm onLogin={handleLogin} />
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Business Search</h2>
              <div className="space-x-4">
                {isAdmin && (
                  <Button variant="outline" onClick={() => navigate('/users')}>
                    Manage Users
                  </Button>
                )}
                <Button variant="outline" onClick={() => setShowSavedSearches(true)}>
                  Past Searches
                </Button>
                <Button variant="destructive" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>

            {showSavedSearches ? (
              <SavedSearchesList
                savedSearches={savedSearches}
                onLoadSearch={handleLoadSavedSearch}
                onBackToSearch={() => setShowSavedSearches(false)}
                onExport={handleExport}
              />
            ) : (
              <>
                <BusinessSearchForm onSearch={handleSearch} isLoading={isLoading} />
                {results.length > 0 && (
                  <>
                    <div className="flex justify-end space-x-4">
                      <Button variant="outline" onClick={handleSaveSearch}>
                        Save Search
                      </Button>
                    </div>
                    <BusinessResultsTable results={results} onExport={handleExport} />
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
