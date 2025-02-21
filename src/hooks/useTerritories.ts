
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Territory {
  id: string;
  name: string;
  active: boolean;
  created_at: string;
}

export const useTerritories = () => {
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTerritories = useCallback(async (userId: number) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('territories')
        .select('*')
        .eq('user_id', userId)
        .order('name');

      if (error) {
        console.error('Error fetching territories:', error);
        throw error;
      }

      console.log('Fetched territories:', data);
      setTerritories(data || []);
    } catch (error) {
      console.error('Error fetching territories:', error);
      toast({
        title: "Error",
        description: "Failed to load territories",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addTerritory = useCallback(async (name: string, userId: number) => {
    try {
      const { data, error } = await supabase
        .from('territories')
        .insert({
          name,
          user_id: userId,
          active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding territory:', error);
        throw error;
      }

      console.log('Added territory:', data);
      setTerritories(prev => [...prev, data]);
      toast({
        title: "Success",
        description: "Territory added successfully",
      });
    } catch (error: any) {
      console.error('Error adding territory:', error);
      toast({
        title: "Error",
        description: error.message.includes('unique constraint') 
          ? "Territory with this name already exists" 
          : "Failed to add territory",
        variant: "destructive",
      });
    }
  }, []);

  const updateTerritory = useCallback(async (id: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from('territories')
        .update({ active })
        .eq('id', id);

      if (error) {
        console.error('Error updating territory:', error);
        throw error;
      }

      setTerritories(prev => 
        prev.map(territory => 
          territory.id === id ? { ...territory, active } : territory
        )
      );

      toast({
        title: "Success",
        description: `Territory ${active ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error) {
      console.error('Error updating territory:', error);
      toast({
        title: "Error",
        description: "Failed to update territory",
        variant: "destructive",
      });
    }
  }, []);

  return {
    territories,
    isLoading,
    fetchTerritories,
    addTerritory,
    updateTerritory
  };
};
