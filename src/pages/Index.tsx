import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";
import BusinessSearchForm from "@/components/business/BusinessSearchForm";
import BusinessResultsTable from "@/components/business/BusinessResultsTable";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface Business {
  id: string;
  name: string;
  phone: string;
  email: string;
  website: string;
  reviewCount: number;
  rating: number;
  address: string;
}

const Index = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [results, setResults] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleSearch = async (location: string, keyword: string) => {
    setIsLoading(true);
    try {
      // Mock API call - replace with real API integration later
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockResults: Business[] = Array.from({ length: 10 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Business ${i + 1}`,
        phone: `(555) 555-${String(1000 + i).padStart(4, '0')}`,
        email: `business${i + 1}@example.com`,
        website: `https://business${i + 1}.com`,
        reviewCount: Math.floor(Math.random() * 500),
        rating: 3 + Math.random() * 2,
        address: `${Math.floor(Math.random() * 1000)} Main St, ${location}`,
      }));

      setResults(mockResults);
      toast({
        title: "Success",
        description: "Search completed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch results",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    toast({
      title: "Coming Soon",
      description: "Export functionality will be implemented soon",
    });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    toast({
      title: "Success",
      description: "Logged out successfully",
    });
  };

  const handleSaveSearch = () => {
    // Mock save functionality
    toast({
      title: "Success",
      description: "Search saved successfully",
    });
  };

  const handleLogin = (isLoggedIn: boolean, userType: 'admin' | 'user') => {
    setIsLoggedIn(isLoggedIn);
    setIsAdmin(userType === 'admin');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {!isLoggedIn ? (
          <LoginForm onLogin={handleLogin} />
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Business Search</h2>
              <div className="space-x-4">
                {isAdmin && (
                  <Button variant="outline" onClick={() => navigate('/users')}>
                    Manage Users
                  </Button>
                )}
                <Button variant="destructive" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>
            <BusinessSearchForm onSearch={handleSearch} isLoading={isLoading} />
            {results.length > 0 && (
              <>
                <div className="flex justify-end space-x-4">
                  <Button variant="outline" onClick={handleSaveSearch}>
                    Save Search
                  </Button>
                </div>
                <BusinessResultsTable results={results} onExport={handleExport} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;