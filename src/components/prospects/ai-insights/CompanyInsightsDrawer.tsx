import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import InsightsList from "./components/InsightsList";
import GenerateInsightButton from "./components/GenerateInsightButton";
import { useInsightGeneration } from "./hooks/useInsightGeneration";

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
  const { isGenerating, retryTimeout, generateInsights } = useInsightGeneration(
    prospectId,
    businessName,
    website,
    onInsightGenerated
  );

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>AI Company Insights</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          <GenerateInsightButton
            isGenerating={isGenerating}
            retryTimeout={retryTimeout}
            onClick={generateInsights}
          />
          <InsightsList insights={website} />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CompanyInsightsDrawer;