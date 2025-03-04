
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

  return (
    <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
      <div className="flex items-center gap-2">
        <span>{prospect.email || '-'}</span>
        {!prospect.email && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEnrichEmail}
                  disabled={enrichingProspectId === prospect.id}
                  className="h-8 w-8 p-0"
                >
                  <Zap className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Enrich with email data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </TableCell>
  );
};

export default ProspectEmailCell;
