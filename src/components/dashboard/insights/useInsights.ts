import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from '@supabase/auth-helpers-react';
import { generateDailyInsights } from "@/utils/insightsGenerator";
import type { AIInsight } from "./types";

export const useInsights = () => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const session = useSession();

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        if (!session?.user?.email) {
          console.log('No user email found in session:', session);
          setError('No user session found');
          setIsLoading(false);
          return;
        }

        console.log('Fetching insights for session user:', session.user.email);
        
        // Get the user ID from the users table using the email
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('email', session.user.email)
          .single();

        if (userError) {
          console.error('Error fetching user:', userError);
          throw new Error('Could not find user account');
        }

        if (!userData?.id) {
          console.error('No user ID found for email:', session.user.email);
          throw new Error('User account not found');
        }

        console.log('Found user ID:', userData.id);

        // Generate insights if needed
        await generateDailyInsights(userData.id);

        // Fetch insights
        const { data: insightsData, error: insightsError } = await supabase
          .from('ai_insights')
          .select('*')
          .eq('user_id', userData.id)
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

    fetchInsights();
  }, [session?.user?.email]);

  return { insights, isLoading, error };
};