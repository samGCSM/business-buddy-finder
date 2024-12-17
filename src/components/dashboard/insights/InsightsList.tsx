import { Card } from "@/components/ui/card";
import InsightCard from "./InsightCard";
import type { AIInsight } from "./types";

interface InsightsListProps {
  insights: AIInsight[];
  isLoading: boolean;
}

const InsightsList = ({ insights, isLoading }: InsightsListProps) => {
  if (isLoading) {
    return (
      <Card className="p-4">
        <p className="text-sm text-gray-500">
          Loading insights...
        </p>
      </Card>
    );
  }

  if (insights.length === 0) {
    return (
      <Card className="p-4">
        <p className="text-sm text-gray-500">
          Generating your daily insights... Check back in a moment!
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {insights.map((insight) => (
        <InsightCard
          key={insight.id}
          id={insight.id}
          content={insight.content}
          contentType={insight.content_type}
          createdAt={insight.created_at}
        />
      ))}
    </div>
  );
};

export default InsightsList;