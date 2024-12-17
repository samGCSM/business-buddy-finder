import { Card } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";
import InsightsList from "./insights/InsightsList";
import { useInsights } from "./insights/useInsights";
import { useSession } from '@supabase/auth-helpers-react';
import { getCurrentUser } from "@/services/userService";
import { useEffect, useState } from "react";

const AIInsights = () => {
  const session = useSession();
  const [currentUser, setCurrentUser] = useState(null);
  const { insights, isLoading, error } = useInsights();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await getCurrentUser();
        console.log('AIInsights - Current user:', user);
        setCurrentUser(user);
      } catch (error) {
        console.error('AIInsights - Error getting current user:', error);
      }
    };
    
    if (session) {
      checkUser();
    }
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