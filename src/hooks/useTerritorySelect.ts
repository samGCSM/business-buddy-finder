
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface UseTerritorySelectProps {
  initialTerritory: string | null;
  prospectId: string;
  onUpdate: () => void;
}

export const useTerritorySelect = ({ initialTerritory, prospectId, onUpdate }: UseTerritorySelectProps) => {
  const [currentTerritory, setCurrentTerritory] = useState(initialTerritory || "");

  useEffect(() => {
    setCurrentTerritory(initialTerritory || "");
  }, [initialTerritory]);

  const handleTerritoryChange = async (value: string) => {
    try {
      setCurrentTerritory(value);
      const { error } = await supabase
        .from('prospects')
        .update({ territory: value })
        .eq('id', prospectId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Territory updated successfully",
      });
      
      onUpdate();
    } catch (error) {
      console.error('Error updating territory:', error);
      setCurrentTerritory(initialTerritory || ""); // Reset on error
      toast({
        title: "Error",
        description: "Failed to update territory",
        variant: "destructive",
      });
    }
  };

  return {
    currentTerritory,
    handleTerritoryChange
  };
};
