import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import NavigationItems from "./NavigationItems";

interface MobileNavigationProps {
  isAdmin: boolean;
  onLogout: () => Promise<void>;
}

const MobileNavigation = ({ isAdmin, onLogout }: MobileNavigationProps) => {
  return (
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
            <NavigationItems isAdmin={isAdmin} onLogout={onLogout} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileNavigation;