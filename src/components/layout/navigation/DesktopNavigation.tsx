import { Button } from "@/components/ui/button";
import { Home, Search, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DesktopNavigationProps {
  isAdmin: boolean;
  onLogout: () => Promise<void>;
}

const DesktopNavigation = ({ isAdmin, onLogout }: DesktopNavigationProps) => {
  const navigate = useNavigate();

  return (
    <div className="hidden md:flex space-x-4">
      <Button variant="outline" onClick={() => navigate('/')}>
        <Home className="h-4 w-4 mr-2" />
        Home
      </Button>
      <Button variant="outline" onClick={() => navigate('/bulk-search')}>
        <Search className="h-4 w-4 mr-2" />
        Bulk Search
      </Button>
      {isAdmin && (
        <Button variant="outline" onClick={() => navigate('/users')}>
          Manage Users
        </Button>
      )}
      <Button 
        variant="outline" 
        onClick={() => navigate('/prospects')}
        className="flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Prospect Now
      </Button>
      <Button variant="outline" onClick={() => navigate('/profile')}>
        Profile
      </Button>
      <Button variant="destructive" onClick={onLogout}>
        Logout
      </Button>
    </div>
  );
};

export default DesktopNavigation;