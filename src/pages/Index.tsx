import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";
import BusinessSearchForm from "@/components/business/BusinessSearchForm";
import BusinessResultsTable from "@/components/business/BusinessResultsTable";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { searchBusinesses } from "@/utils/googleApi";

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

interface SavedSearch {
  id: string;
  date: string;
  location: string;
  keyword: string;
  results: Business[];
}

const Index = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [results, setResults] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);

  const handleSearch = async (location: string, keyword: string) => {
    setIsLoading(true);
    try {
      const businesses = await searchBusinesses(location, keyword);
      setResults(businesses);
      setShowSavedSearches(false);
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

  const handleExport = () => {
    toast({
      title: "Coming Soon",
      description: "Export functionality will be implemented soon",
    });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    toast({
      title: "Success",
      description: "Logged out successfully",
    });
  };

  const handleSaveSearch = () => {
    const newSavedSearch: SavedSearch = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      location: "Current Location", // In real implementation, get from form
      keyword: "Current Keyword", // In real implementation, get from form
      results: results,
    };

    setSavedSearches([...savedSearches, newSavedSearch]);
    toast({
      title: "Success",
      description: "Search saved successfully",
    });
  };

  const handleViewSavedSearches = () => {
    setShowSavedSearches(true);
    setResults([]);
  };

  const handleLoadSavedSearch = (search: SavedSearch) => {
    setResults(search.results);
    setShowSavedSearches(false);
    toast({
      title: "Success",
      description: "Saved search loaded successfully",
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
                <Button variant="outline" onClick={handleViewSavedSearches}>
                  Past Searches
                </Button>
                <Button variant="destructive" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>

            {!showSavedSearches ? (
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
            ) : (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Saved Searches</h3>
                {savedSearches.length === 0 ? (
                  <p className="text-gray-500">No saved searches found.</p>
                ) : (
                  <div className="grid gap-4">
                    {savedSearches.map((search) => (
                      <div
                        key={search.id}
                        className="bg-white p-4 rounded-lg shadow space-y-2"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">
                              {search.location} - {search.keyword}
                            </p>
                            <p className="text-sm text-gray-500">
                              Saved on: {search.date}
                            </p>
                          </div>
                          <div className="space-x-2">
                            <Button
                              variant="outline"
                              onClick={() => handleLoadSavedSearch(search)}
                            >
                              View Results
                            </Button>
                            <Button
                              variant="outline"
                              onClick={handleExport}
                            >
                              Export
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
