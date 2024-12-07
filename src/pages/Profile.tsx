import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@supabase/auth-helpers-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import PasswordChangeForm from "@/components/auth/PasswordChangeForm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const session = useSession();
  const navigate = useNavigate();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  if (!session) {
    navigate("/");
    return null;
  }

  const user = session.user;

  const handlePasswordChange = () => {
    setIsPasswordDialogOpen(true);
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

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">User Profile</h1>
      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Email</h2>
          <p className="text-gray-600">{user.email}</p>
        </div>

        <div className="space-y-4">
          <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handlePasswordChange}>Change Password</Button>
            </DialogTrigger>
            <DialogContent>
              <PasswordChangeForm 
                userId={user.id} 
                onClose={() => setIsPasswordDialogOpen(false)} 
              />
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Profile;