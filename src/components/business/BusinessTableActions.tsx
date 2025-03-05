
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { saveSearch } from "@/services/savedSearchService";
import { getCurrentUser } from "@/services/userService";
import type { Business } from "@/types/business";
import { supabase } from "@/integrations/supabase/client";

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

  const handleExportToProspects = async () => {
    try {
      const currentUser = await getCurrentUser();
      
      if (!currentUser?.id) {
        toast({
          title: "Error",
          description: "Please log in to export prospects",
          variant: "destructive",
        });
        return;
      }

      // Convert businesses to prospect format
      const prospects = results.map(business => ({
        user_id: currentUser.id,
        business_name: business.name,
        website: business.website || null,
        email: business.email || null,
        business_address: business.address || null,
        phone_number: business.phone || null,
        rating: business.rating || 0,
        review_count: business.reviewCount || 0,
        status: "New",
        priority: "Medium",
        location_type: "Business"
      }));

      // Insert prospects into the database
      const { data, error } = await supabase
        .from('prospects')
        .insert(prospects)
        .select();

      if (error) {
        console.error('Error exporting prospects:', error);
        throw error;
      }

      console.log('Exported prospects:', data);
      toast({
        title: "Success",
        description: `${prospects.length} businesses exported to Prospects`,
      });
    } catch (error) {
      console.error('Export to prospects error:', error);
      toast({
        title: "Error",
        description: "Failed to export to Prospects. Please try again.",
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
      <Button 
        type="button" 
        variant="outline" 
        onClick={handleExportToProspects}
        className="bg-blue-500 text-white hover:bg-blue-600"
      >
        Export to Prospects
      </Button>
      <Button type="button" variant="outline" onClick={onExport}>
        Export to Excel
      </Button>
    </div>
  );
};

export default BusinessTableActions;
