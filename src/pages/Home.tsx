import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { User, Calendar, TrendingUp, BarChart } from "lucide-react";

interface DashboardMetrics {
  totalProspects: number;
  activeDeals: number;
  weeklyMeetings: number;
  conversionRate: number;
}

const Home = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalProspects: 0,
    activeDeals: 0,
    weeklyMeetings: 0,
    conversionRate: 0,
  });

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  const fetchDashboardMetrics = async () => {
    try {
      // Get total prospects
      const { data: prospectsData } = await supabase
        .from('prospects')
        .select('count', { count: 'exact' });
      
      // Get active deals (prospects with status 'Meeting' or 'Proposal')
      const { data: activeDealsData } = await supabase
        .from('prospects')
        .select('count', { count: 'exact' })
        .in('status', ['Meeting', 'Proposal']);

      // Get meetings this week (prospects with status 'Meeting' and last_contact within this week)
      const startOfWeek = new Date();
      startOfWeek.setHours(0, 0, 0, 0);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      const { data: meetingsData } = await supabase
        .from('prospects')
        .select('count', { count: 'exact' })
        .eq('status', 'Meeting')
        .gte('last_contact', startOfWeek.toISOString())
        .lte('last_contact', endOfWeek.toISOString());

      // Calculate conversion rate (Won deals / Total prospects)
      const { data: wonDealsData } = await supabase
        .from('prospects')
        .select('count', { count: 'exact' })
        .eq('status', 'Won');

      const totalProspects = prospectsData?.[0]?.count || 0;
      const activeDeals = activeDealsData?.[0]?.count || 0;
      const weeklyMeetings = meetingsData?.[0]?.count || 0;
      const wonDeals = wonDealsData?.[0]?.count || 0;
      
      const conversionRate = totalProspects > 0 
        ? Math.round((wonDeals / totalProspects) * 100) 
        : 0;

      setMetrics({
        totalProspects,
        activeDeals,
        weeklyMeetings,
        conversionRate,
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
    change, 
    icon: Icon 
  }: { 
    title: string; 
    value: number | string; 
    change: string; 
    icon: any 
  }) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-baseline mt-1">
            <p className="text-2xl font-semibold">{value}</p>
            <p className={`ml-2 text-sm ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {change}
            </p>
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
      <Header isAdmin={false} onLogout={handleLogout} />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your prospecting activities</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Prospects"
            value={metrics.totalProspects}
            change="+12%"
            icon={User}
          />
          <MetricCard
            title="Active Deals"
            value={metrics.activeDeals}
            change="+8%"
            icon={TrendingUp}
          />
          <MetricCard
            title="Meetings This Week"
            value={metrics.weeklyMeetings}
            change="+2"
            icon={Calendar}
          />
          <MetricCard
            title="Conversion Rate"
            value={`${metrics.conversionRate}%`}
            change="+4%"
            icon={BarChart}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;