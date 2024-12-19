import { ScrollArea } from "@/components/ui/scroll-area";

interface InsightsListProps {
  insights: Array<{
    content: string;
    timestamp: string;
  }>;
}

const InsightsList = ({ insights }: InsightsListProps) => {
  return (
    <ScrollArea className="h-[calc(100vh-200px)] pr-4">
      <div className="space-y-4">
        {Array.isArray(insights) && insights.length > 0 ? (
          [...insights].reverse().map((insight: any, index: number) => (
            <div
              key={index}
              className="rounded-lg border p-4 text-sm"
            >
              <div className="mb-2 text-xs text-muted-foreground">
                Generated on: {new Date(insight.timestamp).toLocaleString()}
              </div>
              <div className="whitespace-pre-wrap">{insight.content}</div>
            </div>
          ))
        ) : (
          <div className="text-center text-muted-foreground">
            No insights generated yet. Click the button above to generate insights.
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default InsightsList;