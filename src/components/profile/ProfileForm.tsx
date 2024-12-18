import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ProfileFormProps {
  session: any;
  fullName: string;
  email: string;
  onUpdateProfile: (newFullName: string) => void;
}

const ProfileForm = ({ session, fullName, email, onUpdateProfile }: ProfileFormProps) => {
  const [newFullName, setNewFullName] = useState(fullName);

  const updateProfile = async () => {
    try {
      console.log('Updating profile with full name:', newFullName);
      
      const { error: usersError } = await supabase
        .from('users')
        .update({ full_name: newFullName })
        .eq('email', session.user.email);

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