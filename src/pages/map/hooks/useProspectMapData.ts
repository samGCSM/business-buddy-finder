import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from '@supabase/auth-helpers-react';
import { getCurrentUser } from "@/services/userService";
import type { Prospect } from "@/types/prospects";
import type { User } from "@/types/user";

export const useProspectMapData = () => {
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

  // Filter and search functions
  const getMappableProspects = () => {
    const mappableProspects = prospects.filter(p => p.business_address);
    
    // Filter by territory if selected
    let filtered = selectedTerritory === "all"
      ? mappableProspects
      : mappableProspects.filter(p => p.territory === selectedTerritory);
    
    // Apply search filter if terms exist
    if (searchTerm) {
      const terms = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        (p.business_name && p.business_name.toLowerCase().includes(terms)) ||
        (p.business_address && p.business_address.toLowerCase().includes(terms)) ||
        (p.owner_name && p.owner_name.toLowerCase().includes(terms)) ||
        (p.notes && p.notes.toLowerCase().includes(terms))
      );
    }
    
    return filtered;
  };
  
  // Get unique territories from prospects
  const getTerritories = () => {
    return Array.from(
      new Set(prospects.filter(p => p.business_address).map(p => p.territory).filter(Boolean))
    );
  };
  
  return {
    filteredProspects: getMappableProspects(),
    territories: getTerritories(),
    userRole,
    selectedTerritory,
    setSelectedTerritory,
    searchTerm,
    setSearchTerm,
    isLoading,
    handleLogout,
    navigate
  };
};
