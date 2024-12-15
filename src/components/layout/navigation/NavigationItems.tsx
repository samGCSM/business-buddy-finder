import { Button } from "@/components/ui/button";
import { Home, Search, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface NavigationItemsProps {
  isAdmin: boolean;
  onLogout: () => Promise<void>;
}

const NavigationItems = ({ isAdmin, onLogout }: NavigationItemsProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col space-y-4">
      <Button 
        variant="outline" 
        onClick={() => navigate('/')}
        className="w-full justify-start"
      >
        <Home className="h-4 w-4 mr-2" />
        Home
      </Button>
      <Button 
        variant="outline" 
        onClick={() => navigate('/bulk-search')}
        className="w-full justify-start"
      >
        <Search className="h-4 w-4 mr-2" />
        Bulk Search
      </Button>
      {isAdmin && (
        <Button 
          variant="outline" 
          onClick={() => navigate('/users')}
          className="w-full justify-start"
        >
          Manage Users
        </Button>
      )}
      <Button 
        variant="outline" 
        onClick={() => navigate('/prospects')}
        className="w-full justify-start"
      >
        <Plus className="h-4 w-4 mr-2" />
        Prospect Now
      </Button>
      <Button 
        variant="outline" 
        onClick={() => navigate('/profile')}
        className="w-full justify-start"
      >
        Profile
      </Button>
      <Button 
        variant="destructive" 
        onClick={onLogout}
        className="w-full justify-start"
      >
        Logout
      </Button>
    </div>
  );
};

export default NavigationItems;