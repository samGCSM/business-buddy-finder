
import { TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useEmailEnrichment } from "@/hooks/useEmailEnrichment";
import { Prospect } from "@/types/prospects";

interface ProspectEmailCellProps {
  prospect: Prospect;
  onUpdate: () => void;
}

const ProspectEmailCell = ({ prospect, onUpdate }: ProspectEmailCellProps) => {
  const { enrichProspectEmail, enrichingProspectId } = useEmailEnrichment();

  const handleEnrichEmail = async () => {
    const email = await enrichProspectEmail(
      prospect.id,
      prospect.website,
      prospect.business_name
    );
    if (email) onUpdate();
  };

  const isLoading = enrichingProspectId === prospect.id;

  return (
    <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
      <div className="flex items-center gap-2">
        <span>{prospect.email || '-'}</span>
        {!prospect.email && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEnrichEmail}
                  disabled={isLoading}
                  className="ml-2 h-8 w-8 p-0"
                >
                  <Zap className="h-4 w-4" />
                  <span className="sr-only">Find email</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Find email with Hunter.io</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </TableCell>
  );
};

export default ProspectEmailCell;
