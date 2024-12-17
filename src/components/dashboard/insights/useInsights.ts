import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { generateDailyInsights } from "@/utils/insightsGenerator";
import type { AIInsight } from "./types";
import type { User } from "@/types/user";

export const useInsights = (currentUser: User | null) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        if (!currentUser?.id) {
          console.log('useInsights - No user found:', currentUser);
          setError('User not found');
          setIsLoading(false);
          return;
        }

        console.log('useInsights - Fetching insights for user ID:', currentUser.id);

        // Generate insights if needed
        await generateDailyInsights(currentUser.id);

        // Fetch insights
        const { data: insightsData, error: insightsError } = await supabase
          .from('ai_insights')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (insightsError) {
          console.error('Error fetching insights:', insightsError);
          throw insightsError;
        }

        console.log('Fetched insights:', insightsData);
        setInsights(insightsData || []);
        setError(null);
      } catch (error) {
        console.error('Error in fetchInsights:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch insights');
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser) {
      console.log('useInsights - Current user found, fetching insights');
      fetchInsights();
    } else {
      console.log('useInsights - No current user, skipping fetch');
      setIsLoading(false);
    }
  }, [currentUser]);

  return { insights, isLoading, error };
};