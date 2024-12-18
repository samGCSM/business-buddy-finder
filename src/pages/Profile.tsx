import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import PasswordChangeForm from "@/components/auth/PasswordChangeForm";
import ProfileForm from "@/components/profile/ProfileForm";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { getCurrentUser } from "@/services/userService";

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        console.log("Profile - Current user:", currentUser);
        
        if (!currentUser) {
          console.log("Profile - No current user, redirecting to login");
          navigate("/login");
          return;
        }

        setEmail(currentUser.email || '');
        setFullName(currentUser.full_name || '');
        
        // Get session ID from auth
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          setSessionId(session.user.id);
          await getProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error in checkAuth:', error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate]);

  const getProfile = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        if (profileError.code !== 'PGRST116') {
          toast({
            title: "Error",
            description: "Failed to load profile",
            variant: "destructive",
          });
        }
        return;
      }

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
    }
  };

  const handleCloseDialog = () => {
    const closeButton = document.querySelector('button[aria-label="Close"]') as HTMLButtonElement;
    if (closeButton) {
      closeButton.click();
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="p-6">
            <div className="flex justify-center items-center h-64">
              Loading...
            </div>
          </Card>
        </div>
      </div>
    );
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
            {sessionId && (
              <ProfileAvatar 
                sessionId={sessionId}
                avatarUrl={avatarUrl}
                onAvatarUpdate={setAvatarUrl}
              />
            )}
            
            <ProfileForm 
              fullName={fullName}
              email={email}
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
                  userId={sessionId || ''} 
                  onClose={handleCloseDialog} 
                />
              </DialogContent>
            </Dialog>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;