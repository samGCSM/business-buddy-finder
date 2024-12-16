import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Lightbulb } from "lucide-react";
import { useSession } from '@supabase/auth-helpers-react';

interface AIInsight {
  id: string;
  content: string;
  content_type: string;
  created_at: string;
}

const AIInsights = () => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const session = useSession();

  useEffect(() => {
    const fetchInsights = async () => {
      if (!session?.user?.id) return;

      try {
        console.log('Fetching insights for user:', session.user.id);
        const { data, error } = await supabase
          .from('ai_insights')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) {
          console.error('Error fetching insights:', error);
          throw error;
        }

        console.log('Fetched insights:', data);
        setInsights(data || []);
      } catch (error) {
        console.error('Error fetching insights:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, [session?.user?.id]);

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
        {insights.map((insight) => (
          <Card key={insight.id} className="p-4">
            <p className="text-sm text-gray-600">{insight.content}</p>
            <span className="text-xs text-gray-400 mt-2 block">
              {new Date(insight.created_at).toLocaleDateString()}
            </span>
          </Card>
        ))}
        {insights.length === 0 && (
          <p className="text-sm text-gray-500">No insights available yet.</p>
        )}
      </div>
    </div>
  );
};

export default AIInsights;