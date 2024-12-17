import { Card } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";
import InsightsList from "./insights/InsightsList";
import { useInsights } from "./insights/useInsights";

const AIInsights = () => {
  const { insights, isLoading, error } = useInsights();

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
      <InsightsList insights={insights} isLoading={isLoading} />
    </div>
  );
};

export default AIInsights;