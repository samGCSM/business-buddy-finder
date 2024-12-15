import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@supabase/auth-helpers-react";
import { toast } from "@/hooks/use-toast";
import SavedSearchesList from "@/components/business/SavedSearchesList";
import BusinessSearch from "@/components/business/BusinessSearch";
import Header from "@/components/layout/Header";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUser } from "@/services/userService";
import { getSavedSearches, type SavedSearch } from "@/services/savedSearchService";

const BulkSearch = () => {
  const navigate = useNavigate();
  const session = useSession();
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [currentResults, setCurrentResults] = useState<SavedSearch | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      if (!session?.user) {
        navigate("/login");
        return;
      }

      const { data: user } = await supabase
        .from('users')
        .select('type')
        .eq('id', session.user.id)
        .single();

      setIsAdmin(user?.type === 'admin');
    };

    checkUser();
  }, [session, navigate]);

  const loadSavedSearches = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        const searches = await getSavedSearches(currentUser.id.toString());
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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  const handleLoadSavedSearch = (search: SavedSearch) => {
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

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isAdmin={isAdmin} onLogout={handleLogout} />
      <div className="container mx-auto px-4">
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
    </div>
  );
};

export default BulkSearch;
