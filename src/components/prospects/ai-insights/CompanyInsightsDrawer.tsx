import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import InsightsList from "./components/InsightsList";
import GenerateInsightButton from "./components/GenerateInsightButton";
import { useInsightGeneration } from "./hooks/useInsightGeneration";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

interface CompanyInsightsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  prospectId: string;
  businessName: string;
  website: string;
  onInsightGenerated: () => void;
}

interface Insight {
  content: string;
  timestamp: string;
}

const CompanyInsightsDrawer = ({
  isOpen,
  onClose,
  prospectId,
  businessName,
  website,
  onInsightGenerated,
}: CompanyInsightsDrawerProps) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const { isGenerating, retryTimeout, generateInsights } = useInsightGeneration(
    prospectId,
    businessName,
    website,
    onInsightGenerated
  );

  useEffect(() => {
    const fetchInsights = async () => {
      console.log('Fetching insights for prospect:', prospectId);
      const { data, error } = await supabase
        .from('prospects')
        .select('ai_company_insights')
        .eq('id', prospectId)
        .single();

      if (error) {
        console.error('Error fetching insights:', error);
        return;
      }

      if (data?.ai_company_insights) {
        console.log('Received insights:', data.ai_company_insights);
        const formattedInsights = (data.ai_company_insights as Json[]).map((insight: any) => ({
          content: insight.content,
          timestamp: insight.timestamp
        }));
        setInsights(formattedInsights);
      }
    };

    if (isOpen) {
      fetchInsights();
    }
  }, [isOpen, prospectId]);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>AI Company Insights for {businessName}</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          <GenerateInsightButton
            isGenerating={isGenerating}
            retryTimeout={retryTimeout}
            onClick={generateInsights}
          />
          <InsightsList insights={insights} />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CompanyInsightsDrawer;