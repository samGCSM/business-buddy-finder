import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUser } from "@/services/userService";

export interface ProspectFormState {
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
  rating: string;
  review_count: string;
  territory: string;
  location_type: string;
}

const initialState: ProspectFormState = {
  business_name: "",
  notes: "",
  website: "",
  email: "",
  business_address: "",
  phone_number: "",
  owner_name: "",
  status: "New",
  priority: "Medium",
  owner_phone: "",
  owner_email: "",
  rating: "0.0",
  review_count: "0",
  territory: "",
  location_type: "Business",
};

export const useProspectForm = (onSuccess: () => void) => {
  const [formData, setFormData] = useState<ProspectFormState>(initialState);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      status: value
    }));
  };

  const handlePriorityChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      priority: value
    }));
  };

  const handleLocationTypeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      location_type: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log("Form data:", formData);
      
      const currentUser = await getCurrentUser();
      if (!currentUser?.id) {
        toast({
          title: "Error",
          description: "Please log in to add prospects",
          variant: "destructive",
        });
        return;
      }

      console.log("Current user:", currentUser);

      const { data: prospectData, error: insertError } = await supabase
        .from('prospects')
        .insert({
          ...formData,
          rating: parseFloat(formData.rating),
          review_count: parseInt(formData.review_count),
          user_id: currentUser.id,
          last_contact: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error("Insert error:", insertError);
        throw insertError;
      }

      console.log("Successfully added prospect:", prospectData);

      toast({
        title: "Success",
        description: "Prospect added successfully",
      });
      onSuccess();
    } catch (error) {
      console.error('Error adding prospect:', error);
      toast({
        title: "Error",
        description: "Failed to add prospect. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    formData,
    handleChange,
    handleSubmit,
    handleStatusChange,
    handlePriorityChange,
    handleLocationTypeChange,
  };
};