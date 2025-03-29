import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUser } from "@/services/userService";
import { Business } from "@/types/business";
import type { SavedSearch } from "@/services/savedSearchService";

interface SavedSearchesListProps {
  savedSearches: SavedSearch[];
  onLoadSearch: (search: SavedSearch) => void;
  onBackToSearch: () => void;
  onExport: () => void;
}

const SavedSearchesList = ({ savedSearches, onLoadSearch, onBackToSearch, onExport }: SavedSearchesListProps) => {
  const handleExportToProspects = async (search: SavedSearch) => {
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
      const prospects = search.results.map(business => ({
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

      // Get existing prospects for this user
      const { data: existingProspects, error: fetchError } = await supabase
        .from('prospects')
        .select('business_name, business_address')
        .eq('user_id', currentUser.id);

      if (fetchError) {
        console.error('Error fetching existing prospects:', fetchError);
        throw fetchError;
      }

      // Filter out prospects that already exist (based on name and address)
      const uniqueProspects = prospects.filter(newProspect => {
        return !existingProspects?.some(existing => 
          existing.business_name === newProspect.business_name && 
          existing.business_address === newProspect.business_address
        );
      });

      if (uniqueProspects.length === 0) {
        toast({
          title: "Info",
          description: "All businesses are already in your prospects list.",
        });
        return;
      }

      // Insert unique prospects into the database
      const { data, error } = await supabase
        .from('prospects')
        .insert(uniqueProspects)
        .select();

      if (error) {
        console.error('Error exporting prospects:', error);
        throw error;
      }

      console.log('Exported prospects:', data);
      const skippedCount = prospects.length - uniqueProspects.length;
      
      let message = `${uniqueProspects.length} businesses exported to Prospects`;
      if (skippedCount > 0) {
        message += `, ${skippedCount} skipped (already in your list)`;
      }
      
      toast({
        title: "Success",
        description: message,
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Saved Searches</h3>
        <Button variant="outline" onClick={onBackToSearch}>
          Back to Search
        </Button>
      </div>
      {savedSearches.length === 0 ? (
        <p className="text-gray-500">No saved searches found.</p>
      ) : (
        <div className="grid gap-4">
          {savedSearches.map((search) => (
            <div
              key={search.id}
              className="bg-white p-4 rounded-lg shadow space-y-2"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">
                    {search.location} - {search.keyword}
                  </p>
                  <p className="text-sm text-gray-500">
                    Saved on: {search.date}
                  </p>
                  {search.radius && (
                    <p className="text-xs text-gray-500">
                      Radius: {search.radius} miles
                    </p>
                  )}
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => onLoadSearch(search)}
                  >
                    View Results
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-blue-500 text-white hover:bg-blue-600"
                    onClick={() => handleExportToProspects(search)}
                  >
                    Export to Prospects
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onExport}
                  >
                    Export to Excel
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedSearchesList;
