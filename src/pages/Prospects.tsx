import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from '@supabase/auth-helpers-react';
import Header from "@/components/layout/Header";
import ProspectContent from "@/components/prospects/ProspectContent";
import { getCurrentUser } from "@/services/userService";

const Prospects = () => {
  const navigate = useNavigate();
  const session = useSession();
  const [prospects, setProspects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'supervisor' | 'user' | null>(null);

  useEffect(() => {
    const initializePage = async () => {
      const currentUser = await getCurrentUser();
      console.log("Prospects - Checking current user:", currentUser);
      
      if (!currentUser) {
        console.log("Prospects - No user found, redirecting to login");
        navigate('/login');
        return;
      }

      console.log("Prospects - User found, setting role:", currentUser.type);
      setUserRole(currentUser.type as 'admin' | 'supervisor' | 'user');
      await fetchProspects(currentUser);
    };

    initializePage();
  }, [navigate]);

  const fetchProspects = async (currentUser: any) => {
    try {
      console.log('Fetching prospects for user:', currentUser);
      let query = supabase
        .from('prospects')
        .select('*, users!prospects_user_id_fkey (id, email, supervisor_id)');

      if (currentUser.type === 'supervisor') {
        const { data: supervisedUsers } = await supabase
          .from('users')
          .select('id')
          .eq('supervisor_id', currentUser.id);

        if (supervisedUsers) {
          const userIds = supervisedUsers.map(user => user.id);
          query = query.in('user_id', userIds);
        }
      } else if (currentUser.type === 'user') {
        query = query.eq('user_id', currentUser.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching prospects:', error);
        throw error;
      }

      console.log('Fetched prospects:', data);
      setProspects(data || []);
    } catch (error) {
      console.error('Error fetching prospects:', error);
      toast({
        title: "Error",
        description: "Failed to load prospects",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login");
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isAdmin={userRole === 'admin'} onLogout={handleLogout} />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <ProspectContent
          prospects={prospects}
          showAddForm={showAddForm}
          onAddFormClose={() => setShowAddForm(false)}
          onProspectAdded={() => fetchProspects(getCurrentUser())}
          userRole={userRole}
        />
      </div>
    </div>
  );
};

export default Prospects;