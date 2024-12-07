import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@supabase/auth-helpers-react";
import LoginForm from "@/components/auth/LoginForm";
import SavedSearchesList from "@/components/business/SavedSearchesList";
import BusinessSearch from "@/components/business/BusinessSearch";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { getCurrentUser } from "@/services/userService";
import { getSavedSearches, type SavedSearch } from "@/services/savedSearchService";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const session = useSession();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [currentResults, setCurrentResults] = useState<SavedSearch | null>(null);

  useEffect(() => {
    console.log("Index - Session state:", session);
    const checkAuth = async () => {
      if (session) {
        const currentUser = await getCurrentUser();
        console.log("Index - Current user:", currentUser);
        setIsLoggedIn(true);
        setIsAdmin(currentUser?.type === 'admin');
      } else {
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    };
    
    checkAuth();
  }, [session]);

  const loadSavedSearches = async () => {
    try {
      const currentUser = await getCurrentUser();
      console.log('Loading saved searches for user:', currentUser);
      if (currentUser) {
        const searches = await getSavedSearches(currentUser.id.toString());
        console.log('Loaded saved searches:', searches);
        setSavedSearches(searches);
      }
    } catch (error) {
      console.error('Error loading saved searches:', error);
      toast({
        title: "Error",
        description: "Failed to load saved searches",
        variant: "destructive",
      });
    }
  };

  const handleLogin = async (isLoggedIn: boolean, userType: 'admin' | 'user') => {
    console.log("Index - Login handler:", { isLoggedIn, userType });
    setIsLoggedIn(isLoggedIn);
    setIsAdmin(userType === 'admin');
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsLoggedIn(false);
      setIsAdmin(false);
      setShowSavedSearches(false);
      setSavedSearches([]);
      setCurrentResults(null);
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  const handleLoadSavedSearch = (search: SavedSearch) => {
    console.log('Loading saved search:', search);
    setCurrentResults(search);
    setShowSavedSearches(false);
    toast({
      title: "Success",
      description: "Saved search loaded successfully",
    });
  };

  const handleShowSavedSearches = async () => {
    setShowSavedSearches(true);
    setCurrentResults(null);
    await loadSavedSearches();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {!session ? (
          <LoginForm onLogin={handleLogin} />
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-end space-x-4">
              {isAdmin && (
                <Button variant="outline" onClick={() => navigate('/users')}>
                  Manage Users
                </Button>
              )}
              <Button variant="outline" onClick={() => navigate('/profile')}>
                Profile
              </Button>
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
              <BusinessSearch 
                onShowSavedSearches={handleShowSavedSearches}
                initialSearch={currentResults}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;