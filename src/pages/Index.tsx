import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";
import SavedSearchesList from "@/components/business/SavedSearchesList";
import BusinessSearch from "@/components/business/BusinessSearch";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { getCurrentUser } from "@/services/userService";
import { getSavedSearches, type SavedSearch } from "@/services/savedSearchService";

const Index = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);

  useEffect(() => {
    const loadSavedSearches = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          const searches = await getSavedSearches(currentUser.id);
          setSavedSearches(searches);
        }
      } catch (error) {
        console.error('Error loading saved searches:', error);
      }
    };
    if (isLoggedIn) {
      loadSavedSearches();
    }
  }, [isLoggedIn]);

  const handleLogin = async (isLoggedIn: boolean, userType: 'admin' | 'user') => {
    setIsLoggedIn(isLoggedIn);
    setIsAdmin(userType === 'admin');
  };

  const handleLogout = async () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    setShowSavedSearches(false);
    setSavedSearches([]);
    toast({
      title: "Success",
      description: "Logged out successfully",
    });
  };

  const handleLoadSavedSearch = (search: SavedSearch) => {
    setShowSavedSearches(false);
    toast({
      title: "Success",
      description: "Saved search loaded successfully",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {!isLoggedIn ? (
          <LoginForm onLogin={handleLogin} />
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-end space-x-4">
              {isAdmin && (
                <Button variant="outline" onClick={() => navigate('/users')}>
                  Manage Users
                </Button>
              )}
              <Button variant="destructive" onClick={handleLogout}>
                Logout
              </Button>
            </div>

            {showSavedSearches ? (
              <SavedSearchesList
                savedSearches={savedSearches}
                onLoadSearch={handleLoadSavedSearch}
                onBackToSearch={() => setShowSavedSearches(false)}
                onExport={() => {
                  toast({
                    title: "Coming Soon",
                    description: "Export functionality will be implemented soon",
                  });
                }}
              />
            ) : (
              <BusinessSearch onShowSavedSearches={() => setShowSavedSearches(true)} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;