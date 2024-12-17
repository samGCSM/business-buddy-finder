import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { generateDailyInsights } from "@/utils/insightsGenerator";
import type { AIInsight } from "./types";

export const useInsights = (userId: number | null) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        if (!userId) {
          console.log('useInsights - No user ID provided');
          setError('User not found');
          setIsLoading(false);
          return;
        }

        console.log('useInsights - Fetching insights for user ID:', userId);

        // Generate insights if needed
        await generateDailyInsights(userId);

        // Fetch insights
        const { data: insightsData, error: insightsError } = await supabase
          .from('ai_insights')
          .select('*')
          .eq('user_id', userId)
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

    if (userId) {
      console.log('useInsights - User ID found, fetching insights');
      fetchInsights();
    } else {
      console.log('useInsights - No user ID, skipping fetch');
      setIsLoading(false);
    }
  }, [userId]);

  return { insights, isLoading, error };
};