import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useMetrics } from "@/hooks/useMetrics";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import MetricsGraph from "@/components/dashboard/MetricsGraph";
import UserMetricsTable from "@/components/dashboard/UserMetricsTable";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

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
          console.log('Home - No user found, redirecting to login');
          navigate("/login", { replace: true });
          return;
        }

        const userData = JSON.parse(currentUser);
        setUserId(userData.id);
      } catch (error) {
        console.error('Error loading data:', error);
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

  const exportToPDF = async () => {
    try {
      const dashboardElement = document.getElementById('dashboard-content');
      if (!dashboardElement) return;

      // Create a temporary container for the logo and title
      const tempHeader = document.createElement('div');
      tempHeader.style.display = 'flex';
      tempHeader.style.flexDirection = 'column';
      tempHeader.style.alignItems = 'center';
      tempHeader.style.marginBottom = '20px';
      tempHeader.innerHTML = `
        <img src="/lovable-uploads/a39fe416-87d2-481d-bf99-5a86c104e18e.png" 
             alt="Sales Storm Logo" 
             style="width: 100px; height: 100px; margin-bottom: 10px;" />
        <div style="font-size: 24px; font-weight: bold;">Sales Storm Prospecting</div>
      `;
      
      // Insert the header at the top of the dashboard content
      dashboardElement.insertBefore(tempHeader, dashboardElement.firstChild);

      const canvas = await html2canvas(dashboardElement, {
        scale: 2,
        logging: true,
        useCORS: true,
        allowTaint: true
      });

      // Remove the temporary header after capturing
      dashboardElement.removeChild(tempHeader);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save('dashboard-report.pdf');

      toast({
        title: "Success",
        description: "Dashboard exported to PDF",
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: "Error",
        description: "Failed to export dashboard",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isAdmin={userRole === 'admin'} onLogout={handleLogout} />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Overview of your prospecting activities</p>
          </div>
          {['admin', 'supervisor'].includes(userRole || '') && (
            <Button 
              onClick={exportToPDF}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export to PDF
            </Button>
          )}
        </div>
        
        <div id="dashboard-content">
          <DashboardMetrics {...metrics} />

          <div className="mt-8">
            <MetricsGraph userId={userId} userRole={userRole} />
          </div>

          <UserMetricsTable userId={userId} userRole={userRole} />
        </div>
      </div>
    </div>
  );
};

export default Home;
