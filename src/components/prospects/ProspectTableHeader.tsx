
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { Prospect } from "@/types/prospects";

interface ProspectTableHeaderProps {
  onSort: (key: keyof Prospect) => void;
  sortConfig: {
    key: keyof Prospect;
    direction: 'asc' | 'desc';
  } | null;
  allSelected: boolean;
  someSelected: boolean;
  onToggleAll: () => void;
}

const ProspectTableHeader = ({ onSort, sortConfig, allSelected, someSelected, onToggleAll }: ProspectTableHeaderProps) => {
  const renderSortButton = (label: string, key: keyof Prospect) => (
    <Button
      variant="ghost"
      onClick={() => onSort(key)}
      className="h-7 px-1.5 text-xs"
    >
      {label}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );

  return (
    <TableHeader className="sticky top-0 bg-white z-10">
      <TableRow>
        <TableHead className="w-[40px] min-w-[40px]">
          <Checkbox
            checked={allSelected ? true : someSelected ? "indeterminate" : false}
            onCheckedChange={onToggleAll}
          />
        </TableHead>
        <TableHead className="w-[200px] min-w-[200px] sticky left-0 bg-white z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
          {renderSortButton("Business Name", "business_name")}
        </TableHead>
        <TableHead className="w-[60px]">Notes</TableHead>
        <TableHead>{renderSortButton("Territory", "territory")}</TableHead>
        <TableHead>{renderSortButton("Website", "website")}</TableHead>
        <TableHead className="max-w-[150px]">{renderSortButton("Email", "email")}</TableHead>
        <TableHead>{renderSortButton("Address", "business_address")}</TableHead>
        <TableHead className="max-w-[100px]">{renderSortButton("Type", "location_type")}</TableHead>
        <TableHead>{renderSortButton("Phone", "phone_number")}</TableHead>
        <TableHead className="w-[80px]">{renderSortButton("Rating", "rating")}</TableHead>
        <TableHead className="w-[80px]">{renderSortButton("Reviews", "review_count")}</TableHead>
        <TableHead>{renderSortButton("Status", "status")}</TableHead>
        <TableHead>{renderSortButton("Priority", "priority")}</TableHead>
        <TableHead>{renderSortButton("Owner Name", "owner_name")}</TableHead>
        <TableHead>{renderSortButton("Owner Phone", "owner_phone")}</TableHead>
        <TableHead>{renderSortButton("Owner Email", "owner_email")}</TableHead>
        <TableHead>{renderSortButton("Last Contact", "last_contact")}</TableHead>
        <TableHead>Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default ProspectTableHeader;
