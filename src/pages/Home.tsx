import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useMetrics } from "@/hooks/useMetrics";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import MetricsGraph from "@/components/dashboard/MetricsGraph";
import UserMetricsTable from "@/components/dashboard/UserMetricsTable";

const Home = () => {
  const navigate = useNavigate();
  const { metrics, userRole } = useMetrics();
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) {
          navigate("/login");
          return;
        }

        const userData = JSON.parse(currentUser);
        setUserId(userData.id);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Error",
          description: "Failed to load user data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      localStorage.removeItem('currentUser');
      navigate("/login");
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
      </div>
    </div>
  );
};

export default Home;