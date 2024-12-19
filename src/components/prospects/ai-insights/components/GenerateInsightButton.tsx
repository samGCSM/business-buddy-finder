import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface GenerateInsightButtonProps {
  isGenerating: boolean;
  retryTimeout: number | null;
  onClick: () => void;
}

const GenerateInsightButton = ({ 
  isGenerating, 
  retryTimeout, 
  onClick 
}: GenerateInsightButtonProps) => {
  return (
    <Button
      onClick={onClick}
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
  );
};

export default GenerateInsightButton;