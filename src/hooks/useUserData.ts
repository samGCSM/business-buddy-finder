import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/user";
import { toast } from "@/hooks/use-toast";

export const useUserData = (setUsers: (users: User[]) => void) => {
  const [isLoading, setIsLoading] = useState(true);

  const fetchLatestUserData = async () => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*');
      
      if (userError) throw userError;

      const { data: statsData, error: statsError } = await supabase
        .from('user_stats')
        .select('*');

      if (statsError) throw statsError;

      const { data: savedSearchesData, error: savedSearchesError } = await supabase
        .from('saved_searches')
        .select('user_id, id');

      if (savedSearchesError) throw savedSearchesError;

      const savedSearchesCounts = savedSearchesData.reduce((acc: { [key: string]: number }, curr) => {
        acc[curr.user_id] = (acc[curr.user_id] || 0) + 1;
        return acc;
      }, {});

      const enrichedUsers = userData.map(user => ({
        ...user,
        stats: statsData.find(stat => stat.id === user.id),
        savedSearches: savedSearchesCounts[user.id] || 0
      }));

      console.log('Enriched user data:', enrichedUsers);
      setUsers(enrichedUsers);
    } catch (error) {
      console.error('Error fetching latest user data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch latest user data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestUserData();

    const subscription = supabase
      .channel('users_channel')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'users' 
        }, 
        fetchLatestUserData
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [setUsers]);

  return { isLoading };
};