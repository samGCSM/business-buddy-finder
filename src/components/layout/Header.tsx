import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Header = ({ isAdmin, onLogout }: { isAdmin: boolean; onLogout: () => void }) => {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm py-4 px-6 mb-8">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <img 
            src="/lovable-uploads/a39fe416-87d2-481d-bf99-5a86c104e18e.png" 
            alt="Sales Storm Logo" 
            className="w-12 h-12"
          />
          <span className="text-xl font-semibold">Sales Storm Prospecting</span>
        </div>
        <div className="flex space-x-4">
          {isAdmin && (
            <Button variant="outline" onClick={() => navigate('/users')}>
              Manage Users
            </Button>
          )}
          <Button variant="outline" onClick={() => navigate('/profile')}>
            Profile
          </Button>
          <Button variant="destructive" onClick={onLogout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;