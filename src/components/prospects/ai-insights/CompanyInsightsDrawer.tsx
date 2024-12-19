import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface CompanyInsightsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  prospectId: string;
  businessName: string;
  website: string;
  onInsightGenerated: () => void;
}

const CompanyInsightsDrawer = ({
  isOpen,
  onClose,
  prospectId,
  businessName,
  website,
  onInsightGenerated,
}: CompanyInsightsDrawerProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [retryTimeout, setRetryTimeout] = useState<number | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (retryTimeout !== null && retryTimeout > 0) {
      interval = setInterval(() => {
        setRetryTimeout((current) => {
          if (current === null || current <= 1) {
            return null;
          }
          return current - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [retryTimeout]);

  const generateInsights = async () => {
    try {
      setIsGenerating(true);
      console.log('Generating insights for:', businessName);

      const { data: insightData, error: insightError } = await supabase.functions.invoke(
        'generate-company-insights',
        {
          body: { businessName, website },
        }
      );

      if (insightError) {
        // Check if it's a rate limit error
        if (insightError.status === 429) {
          const retryAfter = 60; // Default to 60 seconds if no retry-after header
          setRetryTimeout(retryAfter);
          
          toast({
            title: "Rate limit reached",
            description: `Please try again in ${retryAfter} seconds`,
            variant: "default"
          });
          return;
        }
        throw insightError;
      }

      // First, get the current insights array
      const { data: currentData, error: fetchError } = await supabase
        .from('prospects')
        .select('ai_company_insights')
        .eq('id', prospectId)
        .single();

      if (fetchError) throw fetchError;

      const newInsight = {
        content: insightData.insight,
        timestamp: new Date().toISOString(),
      };

      // Create a new array with the existing insights plus the new one
      const updatedInsights = [...(currentData.ai_company_insights || []), newInsight];

      // Update the prospects table with the new array
      const { error: updateError } = await supabase
        .from('prospects')
        .update({
          ai_company_insights: updatedInsights,
        })
        .eq('id', prospectId);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Company insights generated successfully",
      });

      onInsightGenerated();
    } catch (error) {
      console.error('Error generating insights:', error);
      toast({
        title: "Error",
        description: "Failed to generate company insights",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>AI Company Insights</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          <Button
            onClick={generateInsights}
            disabled={isGenerating || retryTimeout !== null}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Company Insights...
              </>
            ) : retryTimeout !== null ? (
              `Try again in ${retryTimeout} seconds`
            ) : (
              "Generate Company Insights by AI"
            )}
          </Button>
          <ScrollArea className="h-[calc(100vh-200px)] pr-4">
            <div className="space-y-4">
              {Array.isArray(website) && website.length > 0 ? (
                [...website].reverse().map((insight: any, index: number) => (
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
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CompanyInsightsDrawer;