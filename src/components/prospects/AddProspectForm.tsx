import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from '@supabase/auth-helpers-react';
import ProspectFormFields from "./ProspectFormFields";

interface AddProspectFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AddProspectForm = ({ onClose, onSuccess }: AddProspectFormProps) => {
  const session = useSession();
  const [formData, setFormData] = useState({
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
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log("Current user email:", session?.user?.email);
      
      if (!session?.user?.email) {
        throw new Error("User email not found");
      }

      // Get the numeric user ID from the users table
      const { data: userIdData, error: userIdError } = await supabase
        .from('users')
        .select('id')
        .eq('email', session.user.email)
        .single();

      console.log("User ID lookup result:", { userIdData, userIdError });

      if (userIdError || !userIdData) {
        console.error("Failed to get user ID:", userIdError);
        throw new Error("Failed to get user ID");
      }

      console.log("Inserting prospect with user ID:", userIdData.id);

      const { error: insertError } = await supabase
        .from('prospects')
        .insert({
          ...formData,
          user_id: userIdData.id,
        });

      if (insertError) {
        console.error("Insert error:", insertError);
        throw insertError;
      }

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
        <h3 className="text-lg font-semibold mb-4">Add New Prospect</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ProspectFormFields formData={formData} handleChange={handleChange} />
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Add Prospect
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProspectForm;