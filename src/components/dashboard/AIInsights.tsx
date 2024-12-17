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
      try {
        if (!session?.user?.email) {
          console.log('No user session found');
          setIsLoading(false);
          return;
        }

        console.log('Fetching insights for user email:', session.user.email);
        
        // First, get the public.users id that matches the auth.users email
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
          console.error('No matching user found in public.users table');
          throw new Error('User account not properly set up');
        }

        console.log('Found user ID:', userData.id);

        // Generate new insights if needed
        await generateDailyInsights(userData.id);

        // Fetch existing insights for the user
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
  }, [session?.user?.email]);

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
          <p className="text-sm text-red-600">Error: {error}</p>
        </Card>
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
        {isLoading ? (
          <Card className="p-4">
            <p className="text-sm text-gray-500">
              Loading insights...
            </p>
          </Card>
        ) : insights.length > 0 ? (
          insights.map(renderInsightCard)
        ) : (
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