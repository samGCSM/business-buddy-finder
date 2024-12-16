import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useMetrics } from "@/hooks/useMetrics";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";

const Home = () => {
  const navigate = useNavigate();
  const { metrics, userRole } = useMetrics();

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
      </div>
    </div>
  );
};

export default Home;