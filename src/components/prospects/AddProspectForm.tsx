import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from '@supabase/auth-helpers-react';

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
    
    if (!session?.user) {
      toast({
        title: "Error",
        description: "You must be logged in to add prospects",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Current user email:", session.user.email);
      
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="business_name">Business Name *</Label>
              <Input
                id="business_name"
                name="business_name"
                value={formData.business_name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="business_address">Business Address</Label>
              <Input
                id="business_address"
                name="business_address"
                value={formData.business_address}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="owner_name">Owner Name</Label>
              <Input
                id="owner_name"
                name="owner_name"
                value={formData.owner_name}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="owner_phone">Owner Phone</Label>
              <Input
                id="owner_phone"
                name="owner_phone"
                value={formData.owner_phone}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="owner_email">Owner Email</Label>
              <Input
                id="owner_email"
                name="owner_email"
                type="email"
                value={formData.owner_email}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Input
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Input
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
            />
          </div>
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