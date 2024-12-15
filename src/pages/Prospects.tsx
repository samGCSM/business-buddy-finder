import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from '@supabase/auth-helpers-react';
import Header from "@/components/layout/Header";
import ProspectContent from "@/components/prospects/ProspectContent";

const Prospects = () => {
  const navigate = useNavigate();
  const session = useSession();
  const [prospects, setProspects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'supervisor' | 'user' | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserRole();
      fetchProspects();
    }
  }, [session?.user?.id]);

  const fetchUserRole = async () => {
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('type')
        .eq('id', session?.user?.id)
        .single();

      if (error) throw error;
      setUserRole(userData?.type as 'admin' | 'supervisor' | 'user' | null);
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const fetchProspects = async () => {
    try {
      let query = supabase.from('prospects').select(`
        *,
        users!prospects_user_id_fkey (
          id,
          email,
          supervisor_id
        )
      `);

      // Filter prospects based on user role
      if (userRole === 'supervisor') {
        const { data: supervisedUsers } = await supabase
          .from('users')
          .select('id')
          .eq('supervisor_id', session?.user?.id);

        if (supervisedUsers) {
          const userIds = supervisedUsers.map(user => user.id);
          query = query.in('user_id', userIds);
        }
      } else if (userRole === 'user') {
        query = query.eq('user_id', session?.user?.id);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
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
      navigate("/");
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
          onProspectAdded={fetchProspects}
          userRole={userRole}
        />
      </div>
    </div>
  );
};

export default Prospects;