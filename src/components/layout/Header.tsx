import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import MobileNavigation from "./navigation/MobileNavigation";
import DesktopNavigation from "./navigation/DesktopNavigation";

const Header = ({ isAdmin, onLogout }: { isAdmin: boolean; onLogout: () => void }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      console.log("Header - Logging out");
      // First call the parent's logout handler to update app state
      onLogout();
      
      // Then clear local storage and sign out from Supabase
      localStorage.removeItem('currentUser');
      await supabase.auth.signOut();
      
      console.log("Header - Logged out successfully");
      
      // Navigate to login page
      navigate("/login");
      
      // Show success message after navigation
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="bg-white shadow-sm py-4 px-6 mb-8">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <img 
            src="/lovable-uploads/a39fe416-87d2-481d-bf99-5a86c104e18e.png" 
            alt="Sales Storm Logo" 
            className="w-12 h-12"
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
          />
          <span className="text-xl font-semibold">Sales Storm Prospecting</span>
        </div>

        <DesktopNavigation isAdmin={isAdmin} onLogout={handleLogout} />
        <MobileNavigation isAdmin={isAdmin} onLogout={handleLogout} />
      </div>
    </header>
  );
};

export default Header;