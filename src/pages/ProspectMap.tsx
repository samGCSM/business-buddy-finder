import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from '@supabase/auth-helpers-react';
import { getCurrentUser } from "@/services/userService";
import { ArrowLeft, Search } from "lucide-react";
import MapView from "@/components/map/MapView";
import type { Prospect } from "@/types/prospects";
import type { User } from "@/types/user";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const ProspectMap = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const session = useSession();
  
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [userRole, setUserRole] = useState<'admin' | 'supervisor' | 'user' | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedTerritory, setSelectedTerritory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  useEffect(() => {
    const initializePage = async () => {
      try {
        // Check if we have prospects from location state
        if (location.state?.prospects) {
          setProspects(location.state.prospects);
          
          // Extract territories for filtering
          const territories = Array.from(
            new Set(location.state.prospects.map((p: Prospect) => p.territory).filter(Boolean))
          );
          
          if (territories.length) {
            setSelectedTerritory("all");
          }
        } else {
          // Otherwise, fetch them
          const user = await getCurrentUser();
          
          if (!user) {
            console.log("ProspectMap - No user found, redirecting to login");
            navigate('/login');
            return;
          }
          
          setUserRole(user.type as 'admin' | 'supervisor' | 'user');
          setCurrentUser(user);
          
          await fetchProspects(user.id);
        }
      } catch (error) {
        console.error("Error initializing map page:", error);
        toast({
          title: "Error",
          description: "Failed to load prospect data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    initializePage();
  }, [location, navigate]);
  
  const fetchProspects = async (userId: number) => {
    try {
      const { data, error } = await supabase
        .from('prospects')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      setProspects(data || []);
    } catch (error) {
      console.error('Error fetching prospects:', error);
      toast({
        title: "Error",
        description: "Failed to load prospects",
        variant: "destructive",
      });
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
  
  // Get mappable prospects (those with addresses)
  const mappableProspects = prospects.filter(p => p.business_address);
  
  // Filter by territory if selected
  let filteredProspects = selectedTerritory === "all"
    ? mappableProspects
    : mappableProspects.filter(p => p.territory === selectedTerritory);
  
  // Apply search filter if terms exist
  if (searchTerm) {
    const terms = searchTerm.toLowerCase();
    filteredProspects = filteredProspects.filter(p => 
      (p.business_name && p.business_name.toLowerCase().includes(terms)) ||
      (p.business_address && p.business_address.toLowerCase().includes(terms)) ||
      (p.owner_name && p.owner_name.toLowerCase().includes(terms)) ||
      (p.notes && p.notes.toLowerCase().includes(terms))
    );
  }
  
  // Get unique territories from prospects
  const territories = Array.from(
    new Set(mappableProspects.map(p => p.territory).filter(Boolean))
  );
  
  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header isAdmin={userRole === 'admin'} onLogout={handleLogout} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/prospects')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Prospects
            </Button>
            <h1 className="text-2xl font-bold">
              Prospect Map ({filteredProspects.length} locations)
            </h1>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="relative md:col-span-3">
            <div className="absolute left-4 top-4 z-10 w-72">
              <div className="bg-white p-3 rounded-lg shadow-lg space-y-3">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Search prospects..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select
                  value={selectedTerritory}
                  onValueChange={setSelectedTerritory}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by Territory" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Territories</SelectItem>
                    {territories.map((territory) => (
                      <SelectItem key={territory} value={territory}>
                        {territory}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
        
        {filteredProspects.length > 0 ? (
          <div className="bg-white p-4 rounded-lg shadow">
            <MapView prospects={filteredProspects} />
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg shadow flex flex-col items-center justify-center">
            <p className="text-lg text-gray-600 mb-4">No prospects with addresses found to display on the map.</p>
            <Button onClick={() => navigate('/prospects')}>Return to Prospects</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProspectMap;
