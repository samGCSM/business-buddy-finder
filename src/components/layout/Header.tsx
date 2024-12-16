import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import MobileNavigation from "./navigation/MobileNavigation";
import DesktopNavigation from "./navigation/DesktopNavigation";
import NotificationIndicator from "./notifications/NotificationIndicator";
import Logo from "./Logo";

const Header = ({ isAdmin, onLogout }: { isAdmin: boolean; onLogout: () => void }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      console.log("Header - Logging out");
      onLogout();
      localStorage.removeItem('currentUser');
      await supabase.auth.signOut();
      console.log("Header - Logged out successfully");
      navigate("/login");
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
        <Logo />
        <div className="flex items-center space-x-4">
          <NotificationIndicator />
          <DesktopNavigation isAdmin={isAdmin} onLogout={handleLogout} />
          <MobileNavigation isAdmin={isAdmin} onLogout={handleLogout} />
        </div>
      </div>
    </header>
  );
};

export default Header;