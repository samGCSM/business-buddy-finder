import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@supabase/auth-helpers-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { UserRound, Camera } from "lucide-react";
import PasswordChangeForm from "@/components/auth/PasswordChangeForm";
import ProfileForm from "@/components/profile/ProfileForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const Profile = () => {
  const session = useSession();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    console.log("Profile - Session state:", session);
    const checkAuth = async () => {
      if (!session?.user?.email) {
        console.log("Profile - No current user, redirecting to home");
        navigate("/");
        return;
      }
      getProfile();
    };
    
    checkAuth();
  }, [navigate, session]);

  const getProfile = async () => {
    try {
      if (!session?.user?.email) return;

      // Fetch user data from the users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('full_name')
        .eq('email', session.user.email)
        .single();

      if (userError) throw userError;

      if (userData) {
        console.log('Fetched user data:', userData);
        setFullName(userData.full_name || '');
      }

      // Fetch avatar from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', session.user.id)
        .single();

      if (profileError) throw profileError;

      if (profileData) {
        setAvatarUrl(profileData.avatar_url);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${session?.user?.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', session?.user?.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast({
        title: "Success",
        description: "Avatar updated successfully",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: "Failed to upload avatar",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Success",
        description: "Signed out successfully",
      });
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  const handleCloseDialog = () => {
    const closeButton = document.querySelector('button[aria-label="Close"]') as HTMLButtonElement;
    if (closeButton) {
      closeButton.click();
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">User Profile</h1>
          <Button variant="outline" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </div>
        
        <Card className="p-6 space-y-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarUrl || ''} alt="Profile" />
                <AvatarFallback>
                  <UserRound className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
              <label 
                htmlFor="avatar-upload" 
                className="absolute bottom-0 right-0 p-1 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90"
              >
                <Camera className="h-4 w-4" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={uploadAvatar}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
            
            <ProfileForm 
              session={session}
              fullName={fullName}
              email={session?.user?.email || ''}
              onUpdateProfile={setFullName}
            />
          </div>

          <div className="space-y-4 pt-4 border-t">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  Change Password
                </Button>
              </DialogTrigger>
              <DialogContent>
                <PasswordChangeForm 
                  userId={session?.user?.id || ''} 
                  onClose={handleCloseDialog} 
                />
              </DialogContent>
            </Dialog>

            <Button 
              variant="destructive" 
              onClick={handleSignOut}
              className="w-full"
            >
              Sign Out
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
