import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@supabase/auth-helpers-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import PasswordChangeForm from "@/components/auth/PasswordChangeForm";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUser } from "@/services/userService";

const Profile = () => {
  const session = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Profile - Session state:", session);
    const checkAuth = async () => {
      const currentUser = await getCurrentUser();
      console.log("Profile - Current user:", currentUser);
      if (!currentUser) {
        console.log("Profile - No current user, redirecting to home");
        navigate("/");
      }
    };
    
    checkAuth();
  }, [navigate]);

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
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Email</h2>
            <p className="text-gray-600">{session?.user?.email}</p>
          </div>

          <div className="space-y-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button>Change Password</Button>
              </DialogTrigger>
              <DialogContent>
                <PasswordChangeForm 
                  userId={session?.user?.id || ''} 
                  onClose={handleCloseDialog} 
                />
              </DialogContent>
            </Dialog>

            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;