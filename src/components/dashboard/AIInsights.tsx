import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Lightbulb } from "lucide-react";
import { useSession } from '@supabase/auth-helpers-react';
import { generateDailyInsights } from "@/utils/insightsGenerator";

interface AIInsight {
  id: string;
  content: string;
  content_type: string;
  created_at: string;
}

const AIInsights = () => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const session = useSession();

  useEffect(() => {
    const fetchInsights = async () => {
      if (!session?.user?.id) {
        console.log('No user session found, skipping insights fetch');
        setIsLoading(false);
        return;
      }

      try {
        console.log('Fetching insights for auth user:', session.user.id);
        
        // First, get the public.users id that matches the auth.users email
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('email', session.user.email)
          .single();

        if (userError) {
          console.error('Error fetching user:', userError);
          throw userError;
        }

        if (!userData) {
          console.log('No matching user found in public.users table');
          setIsLoading(false);
          return;
        }

        // Generate new insights if needed
        await generateDailyInsights(userData.id);

        // Fetch all insights for the user
        const { data, error } = await supabase
          .from('ai_insights')
          .select('*')
          .eq('user_id', userData.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) {
          console.error('Error fetching insights:', error);
          throw error;
        }

        console.log('Fetched insights:', data);
        setInsights(data || []);
      } catch (error) {
        console.error('Error in fetchInsights:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch insights');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, [session?.user?.id, session?.user?.email]);

  const renderInsightCard = (insight: AIInsight) => {
    const isMotivation = insight.content_type === 'daily_motivation';
    const bgColor = isMotivation ? 'bg-blue-50' : 'bg-green-50';
    const icon = isMotivation ? '🌟' : '📋';
    
    return (
      <Card key={insight.id} className={`p-4 ${bgColor}`}>
        <div className="flex items-start gap-2">
          <span className="text-xl">{icon}</span>
          <div>
            <p className="text-sm text-gray-600">{insight.content}</p>
            <span className="text-xs text-gray-400 mt-2 block">
              {new Date(insight.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </Card>
    );
  };

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          AI Insights
        </h2>
        <Card className="p-4 bg-red-50">
          <p className="text-sm text-red-600">Error loading insights: {error}</p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          AI Insights
        </h2>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-100 rounded w-1/4 mt-2"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <Lightbulb className="w-5 h-5" />
        AI Insights
      </h2>
      <div className="grid gap-4">
        {insights.map(renderInsightCard)}
        {insights.length === 0 && (
          <Card className="p-4">
            <p className="text-sm text-gray-500">
              Generating your daily insights... Check back in a moment!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AIInsights;