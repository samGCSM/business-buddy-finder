import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from '@supabase/auth-helpers-react';
import Header from "@/components/layout/Header";
import ProspectContent from "@/components/prospects/ProspectContent";
import { getCurrentUser } from "@/services/userService";
import type { User } from "@/types/user";

const Prospects = () => {
  const navigate = useNavigate();
  const session = useSession();
  const [prospects, setProspects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'supervisor' | 'user' | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [supervisedUsers, setSupervisedUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  useEffect(() => {
    const initializePage = async () => {
      const user = await getCurrentUser();
      console.log("Prospects - Checking current user:", user);
      
      if (!user) {
        console.log("Prospects - No user found, redirecting to login");
        navigate('/login');
        return;
      }

      console.log("Prospects - User found, setting role:", user.type);
      setUserRole(user.type as 'admin' | 'supervisor' | 'user');
      setCurrentUser(user);
      setSelectedUserId(user.id);

      if (user.type === 'admin') {
        // Fetch all users for admin
        const { data: allUsers } = await supabase
          .from('users')
          .select('*')
          .neq('id', user.id);
        setSupervisedUsers(allUsers || []);
      } else if (user.type === 'supervisor') {
        // Fetch users under this supervisor
        const { data: supervisedUsersData } = await supabase
          .from('users')
          .select('*')
          .eq('supervisor_id', user.id);
        setSupervisedUsers(supervisedUsersData || []);
      }

      await fetchProspects(user, user.id);
    };

    initializePage();
  }, [navigate]);

  const fetchProspects = async (currentUser: any, userId: number) => {
    try {
      console.log('Fetching prospects for user:', userId);
      let query = supabase
        .from('prospects')
        .select('*, users!prospects_user_id_fkey (id, email, supervisor_id)');

      if (currentUser.type === 'user') {
        query = query.eq('user_id', currentUser.id);
      } else {
        query = query.eq('user_id', userId);
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

  const handleUserSelect = async (userId: number) => {
    setSelectedUserId(userId);
    if (currentUser) {
      await fetchProspects(currentUser, userId);
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
      <div className="w-full px-4 py-8">
        <ProspectContent
          prospects={prospects}
          showAddForm={showAddForm}
          onAddFormClose={() => setShowAddForm(false)}
          onProspectAdded={() => currentUser && selectedUserId && fetchProspects(currentUser, selectedUserId)}
          userRole={userRole}
          currentUser={currentUser}
          onUserSelect={handleUserSelect}
          supervisedUsers={supervisedUsers}
        />
      </div>
    </div>
  );
};

export default Prospects;