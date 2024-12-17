import { Card } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";
import InsightsList from "./insights/InsightsList";
import { useInsights } from "./insights/useInsights";
import { useSession } from '@supabase/auth-helpers-react';
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const AIInsights = () => {
  const session = useSession();
  const [userId, setUserId] = useState<number | null>(null);
  const { insights, isLoading, error } = useInsights(userId);

  useEffect(() => {
    const getCurrentUserId = async () => {
      if (!session) {
        console.log('AIInsights - No session found');
        setUserId(null);
        return;
      }

      try {
        // Get the current user's ID directly from the users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('email', session.user.email)
          .single();

        if (userError) {
          console.error('AIInsights - Error getting user:', userError);
          setUserId(null);
          return;
        }

        if (userData) {
          console.log('AIInsights - Found user ID:', userData.id);
          setUserId(userData.id);
        }
      } catch (error) {
        console.error('AIInsights - Error in getCurrentUserId:', error);
        setUserId(null);
      }
    };

    getCurrentUserId();
  }, [session]);

  if (!session) {
    return (
      <Card className="p-4">
        <p className="text-sm text-gray-500">Please log in to view insights</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <Lightbulb className="w-5 h-5" />
        AI Insights
      </h2>
      <InsightsList insights={insights} isLoading={isLoading} error={error} />
    </div>
  );
};

export default AIInsights;