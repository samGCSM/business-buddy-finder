
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ProspectFormFields from "./ProspectFormFields";
import { getCurrentUser } from "@/services/userService";
import { useTerritories } from "@/hooks/useTerritories";
import { ScrollArea } from "@/components/ui/scroll-area";
import ProspectFormContainer from "./form/ProspectFormContainer";
import ProspectFormActions from "./form/ProspectFormActions";

interface EditProspectFormProps {
  prospect: {
    id: string;
    business_name: string;
    notes: string;
    website: string;
    email: string;
    business_address: string;
    phone_number: string;
    owner_name: string;
    status: string;
    priority: string;
    owner_phone: string;
    owner_email: string;
    rating: number;
    review_count: number;
    territory: string;
    location_type?: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

const EditProspectForm = ({ prospect, onClose, onSuccess }: EditProspectFormProps) => {
  const [userId, setUserId] = useState<number | null>(null);
  const { territories, fetchTerritories } = useTerritories();
  const [formData, setFormData] = useState({
    business_name: prospect.business_name,
    notes: prospect.notes || "",
    website: prospect.website || "",
    email: prospect.email === "N/A" ? "" : prospect.email || "",
    business_address: prospect.business_address || "",
    phone_number: prospect.phone_number || "",
    owner_name: prospect.owner_name || "",
    status: prospect.status || "New",
    priority: prospect.priority || "Medium",
    owner_phone: prospect.owner_phone || "",
    owner_email: prospect.owner_email === "N/A" ? "" : prospect.owner_email || "",
    rating: prospect.rating?.toString() || "0.0",
    review_count: prospect.review_count?.toString() || "0",
    territory: prospect.territory || "",
    location_type: prospect.location_type || "Business",
  });

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      if (user) {
        setUserId(user.id);
        await fetchTerritories(user.id);
      }
    };
    fetchUser();
  }, [fetchTerritories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log("Updating prospect:", prospect.id);
      console.log("Form data:", formData);

      const { data, error } = await supabase
        .from('prospects')
        .update({
          ...formData,
          rating: parseFloat(formData.rating),
          review_count: parseInt(formData.review_count)
        })
        .eq('id', prospect.id)
        .select()
        .single();

      if (error) throw error;

      console.log("Successfully updated prospect:", data);

      toast({
        title: "Success",
        description: "Prospect updated successfully",
      });
      onSuccess();
    } catch (error) {
      console.error('Error updating prospect:', error);
      toast({
        title: "Error",
        description: "Failed to update prospect. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationTypeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      location_type: value
    }));
  };

  const handleTerritoryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      territory: value
    }));
  };

  return (
    <ProspectFormContainer title="Edit Prospect" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <ScrollArea className="h-[calc(80vh-10rem)] pr-4">
          <div className="pb-4">
            <ProspectFormFields 
              formData={formData} 
              handleChange={handleChange}
              onLocationTypeChange={handleLocationTypeChange}
              onTerritoryChange={handleTerritoryChange}
              territories={territories}
              userId={userId || undefined}
            />
          </div>
        </ScrollArea>
        
        <ProspectFormActions onClose={onClose} submitLabel="Save Changes" />
      </form>
    </ProspectFormContainer>
  );
};

export default EditProspectForm;
