import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { saveSearch } from "@/services/savedSearchService";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from 'react';
import type { Business } from "@/types/business";

interface BusinessTableActionsProps {
  results: Business[];
  location: string;
  keyword: string;
  onExport: () => void;
}

const BusinessTableActions = ({ results, location, keyword, onExport }: BusinessTableActionsProps) => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Current session:', session);
      if (session?.user?.id) {
        setUserId(session.user.id);
      }
    };

    checkSession();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', session);
      setUserId(session?.user?.id || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSaveSearch = async () => {
    try {
      if (!userId) {
        console.log('No user ID found');
        toast({
          title: "Error",
          description: "Please log in to save searches",
          variant: "destructive",
        });
        return;
      }

      console.log('Saving search for user:', userId);
      await saveSearch(userId, location, keyword, results);
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