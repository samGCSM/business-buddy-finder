import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { saveSearch } from "@/services/savedSearchService";
import { supabase } from "@/integrations/supabase/client";
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
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Current session:', session);

      if (!session?.user?.id) {
        console.log('No session found:', session);
        toast({
          title: "Error",
          description: "Please log in to save searches",
          variant: "destructive",
        });
        return;
      }

      console.log('Saving search for user:', session.user.id);
      await saveSearch(session.user.id, location, keyword, results);
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