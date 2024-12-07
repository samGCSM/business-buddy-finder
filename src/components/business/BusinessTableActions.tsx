import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { saveSearch } from "@/services/savedSearchService";
import { getCurrentUser } from "@/services/userService";
import type { Business } from "@/types/business";

interface BusinessTableActionsProps {
  results: Business[];
  location: string;
  keyword: string;
  onExport: () => void;
}

const BusinessTableActions = ({ results, location, keyword, onExport }: BusinessTableActionsProps) => {
  const handleSaveSearch = async () => {
    try {
      const currentUser = await getCurrentUser();
      console.log('Current user:', currentUser);

      if (!currentUser?.id) {
        console.log('No user found:', currentUser);
        toast({
          title: "Error",
          description: "Please log in to save searches",
          variant: "destructive",
        });
        return;
      }

      console.log('Saving search for user:', currentUser.id);
      await saveSearch(currentUser.id.toString(), location, keyword, results);
      toast({
        title: "Success",
        description: "Search saved successfully",
      });
    } catch (error) {
      console.error('Save search error:', error);
      toast({
        title: "Error",
        description: "Failed to save search. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex justify-end gap-2">
      <Button 
        type="button" 
        variant="outline" 
        onClick={handleSaveSearch}
        className="bg-green-500 text-white hover:bg-green-600"
      >
        Save Search
      </Button>
      <Button type="button" variant="outline" onClick={onExport}>
        Export to Excel
      </Button>
    </div>
  );
};

export default BusinessTableActions;