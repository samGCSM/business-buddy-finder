import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUser } from "@/services/userService";

interface ProfileFormProps {
  session: any;
  fullName: string;
  email: string;
  onUpdateProfile: (newFullName: string) => void;
}

const ProfileForm = ({ fullName, email, onUpdateProfile }: ProfileFormProps) => {
  const [newFullName, setNewFullName] = useState(fullName);

  const updateProfile = async () => {
    try {
      console.log('Updating profile with full name:', newFullName);
      
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        throw new Error('No user found');
      }

      const { error: usersError } = await supabase
        .from('users')
        .update({ full_name: newFullName })
        .eq('email', currentUser.email);

      if (usersError) throw usersError;

      onUpdateProfile(newFullName);
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex-1">
      <Label htmlFor="email">Email</Label>
      <Input
        id="email"
        type="email"
        value={email}
        disabled
        className="mb-4"
      />
      <Label htmlFor="fullName">Full Name</Label>
      <Input
        id="fullName"
        value={newFullName}
        onChange={(e) => setNewFullName(e.target.value)}
        className="mb-2"
      />
      <Button onClick={updateProfile} size="sm">
        Update Profile
      </Button>
    </div>
  );
};

export default ProfileForm;