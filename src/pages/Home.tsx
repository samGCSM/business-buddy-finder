import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Users, Mail, PhoneCall, UserPlus } from "lucide-react";
import { getCurrentUser } from "@/services/userService";

interface DashboardMetrics {
  totalProspects: number;
  newProspects: number;
  emailsSent: number;
  callsMade: number;
}

const Home = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalProspects: 0,
    newProspects: 0,
    emailsSent: 0,
    callsMade: 0,
  });
  const [userRole, setUserRole] = useState<'admin' | 'supervisor' | 'user' | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const initializePage = async () => {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUserRole(currentUser.type as 'admin' | 'supervisor' | 'user');
        setUserId(currentUser.id);
      }
      fetchDashboardMetrics(currentUser);
    };

    initializePage();
  }, []);

  const fetchDashboardMetrics = async (currentUser: any) => {
    try {
      let query = supabase.from('prospects').select('*');
      
      // Filter based on user role
      if (currentUser.type === 'user') {
        query = query.eq('user_id', currentUser.id);
      } else if (currentUser.type === 'supervisor') {
        const { data: supervisedUsers } = await supabase
          .from('users')
          .select('id')
          .eq('supervisor_id', currentUser.id);
        
        const userIds = supervisedUsers?.map(user => user.id) || [];
        userIds.push(currentUser.id); // Include supervisor's own prospects
        query = query.in('user_id', userIds);
      }
      // For admin, fetch all prospects (no additional filter needed)

      // Get total prospects
      const { data: prospectsData, error: prospectsError } = await query;
      
      if (prospectsError) throw prospectsError;

      // Get new prospects (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const newProspectsCount = prospectsData?.filter(
        prospect => new Date(prospect.created_at) > thirtyDaysAgo
      ).length || 0;

      // Count emails and calls from activity_log
      let emailCount = 0;
      let callCount = 0;

      prospectsData?.forEach(prospect => {
        if (prospect.activity_log) {
          prospect.activity_log.forEach((activity: any) => {
            if (activity.type === 'Email') emailCount++;
            if (activity.type === 'Phone Call') callCount++;
          });
        }
      });

      setMetrics({
        totalProspects: prospectsData?.length || 0,
        newProspects: newProspectsCount,
        emailsSent: emailCount,
        callsMade: callCount,
      });

    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard metrics",
        variant: "destructive",
      });
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
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  const MetricCard = ({ 
    title, 
    value, 
    icon: Icon 
  }: { 
    title: string; 
    value: number; 
    icon: any;
  }) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-baseline mt-1">
            <p className="text-2xl font-semibold">{value}</p>
          </div>
        </div>
        <div className="p-2 bg-gray-50 rounded-lg">
          <Icon className="w-6 h-6 text-gray-600" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isAdmin={userRole === 'admin'} onLogout={handleLogout} />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your prospecting activities</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Prospects"
            value={metrics.totalProspects}
            icon={Users}
          />
          <MetricCard
            title="New Prospects (30d)"
            value={metrics.newProspects}
            icon={UserPlus}
          />
          <MetricCard
            title="Emails Sent"
            value={metrics.emailsSent}
            icon={Mail}
          />
          <MetricCard
            title="Calls Made"
            value={metrics.callsMade}
            icon={PhoneCall}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;