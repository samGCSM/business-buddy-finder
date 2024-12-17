import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from '@supabase/auth-helpers-react';
import { generateDailyInsights } from "@/utils/insightsGenerator";
import { getCurrentUser } from "@/services/userService";
import type { AIInsight } from "./types";

export const useInsights = () => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const session = useSession();

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        if (!session) {
          console.log('useInsights - No session found');
          setError('No user session found');
          setIsLoading(false);
          return;
        }

        const currentUser = await getCurrentUser();
        console.log('useInsights - Current user:', currentUser);

        if (!currentUser?.id) {
          console.log('No user ID found in current user:', currentUser);
          setError('User not found');
          setIsLoading(false);
          return;
        }

        console.log('Fetching insights for user ID:', currentUser.id);

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

    if (session) {
      fetchInsights();
    }
  }, [session]);

  return { insights, isLoading, error };
};