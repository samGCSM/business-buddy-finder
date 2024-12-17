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
        if (!session?.user?.id) {
          console.log('No user session found');
          setError('No user session found');
          setIsLoading(false);
          return;
        }

        console.log('Current auth user ID:', session.user.id);
        
        // First, get the user's email from auth
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error('Error fetching auth user:', authError);
          throw new Error('Could not fetch auth user');
        }

        if (!authUser?.email) {
          console.error('No email found for auth user');
          throw new Error('User email not found');
        }

        console.log('Fetching insights for user email:', authUser.email);
        
        // Then get the public.users record
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('email', authUser.email)
          .single();

        if (userError) {
          console.error('Error fetching user:', userError);
          throw new Error('Could not find user account');
        }

        if (!userData?.id) {
          console.error('No matching user found in public.users table');
          throw new Error('User account not properly set up');
        }

        console.log('Found user ID in public.users:', userData.id);

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
      } catch (error) {
        console.error('Error in fetchInsights:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch insights');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, [session?.user?.id]);

  return { insights, isLoading, error };
};