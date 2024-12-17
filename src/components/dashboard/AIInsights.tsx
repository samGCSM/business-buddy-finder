import { Card } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";
import InsightsList from "./insights/InsightsList";
import { useInsights } from "./insights/useInsights";
import { useState, useEffect } from "react";

const AIInsights = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const { insights, isLoading, error } = useInsights(currentUser?.id);

  useEffect(() => {
    // Simple way to get the current user from localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      console.log('AIInsights - Found user in localStorage');
      setCurrentUser(JSON.parse(storedUser));
    } else {
      console.log('AIInsights - No user found in localStorage');
    }
  }, []);

  if (!currentUser) {
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