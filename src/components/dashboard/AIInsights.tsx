import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Lightbulb } from "lucide-react";

interface AIInsight {
  id: string;
  content: string;
  content_type: string;
  created_at: string;
}

const AIInsights = () => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const { data, error } = await supabase
          .from('ai_insights')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;
        setInsights(data || []);
      } catch (error) {
        console.error('Error fetching insights:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, []);

  if (isLoading) {
    return <div>Loading insights...</div>;
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