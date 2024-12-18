import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useMetrics } from "@/hooks/useMetrics";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import MetricsGraph from "@/components/dashboard/MetricsGraph";
import UserMetricsTable from "@/components/dashboard/UserMetricsTable";
import InsightCard from "@/components/dashboard/InsightCard";
import { getInsights } from "@/services/insightsService";
import { getCurrentUser } from "@/services/userService";

const Home = () => {
  const navigate = useNavigate();
  const { metrics, userRole } = useMetrics();
  const [insight, setInsight] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const loadInsights = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          navigate("/login");
          return;
        }

        setUserId(currentUser.id);
        const userInsight = await getInsights(currentUser.id, currentUser.type);
        setInsight(userInsight.dailyInsight);
      } catch (error) {
        console.error('Error loading insights:', error);
        toast({
          title: "Error",
          description: "Failed to load insights",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadInsights();
  }, [navigate]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isAdmin={userRole === 'admin'} onLogout={handleLogout} />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your prospecting activities</p>
        </div>
        
        <DashboardMetrics {...metrics} />

        <div className="mt-8">
          <MetricsGraph userId={userId} userRole={userRole} />
        </div>

        <UserMetricsTable userId={userId} userRole={userRole} />

        <div className="mt-8">
          <InsightCard 
            title="Daily Sales Insight" 
            content={insight} 
          />
        </div>
      </div>
    </div>
  );
};

export default Home;