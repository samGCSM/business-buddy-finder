import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, Plus } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Header = ({ isAdmin, onLogout }: { isAdmin: boolean; onLogout: () => void }) => {
  const navigate = useNavigate();

  const NavigationItems = () => (
    <div className="flex flex-col space-y-4">
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

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-4">
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

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <NavigationItems />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;