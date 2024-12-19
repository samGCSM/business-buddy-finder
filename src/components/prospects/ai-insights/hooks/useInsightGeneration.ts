import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useInsightGeneration = (
  prospectId: string,
  businessName: string,
  website: string,
  onInsightGenerated: () => void
) => {
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
        console.error('Error generating insights:', insightError);
        throw insightError;
      }

      // Handle quota exceeded error from the edge function
      if (insightData?.isQuotaError) {
        toast({
          title: "OpenAI API Quota Exceeded",
          description: "Please check your OpenAI API billing details and ensure you have available credits.",
          variant: "destructive",
        });
        return;
      }

      if (!insightData?.insight) {
        throw new Error('No insight generated');
      }

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

      const updatedInsights = [...(currentData?.ai_company_insights || []), newInsight];

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
    } catch (error: any) {
      console.error('Error generating insights:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate company insights",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    retryTimeout,
    generateInsights
  };
};