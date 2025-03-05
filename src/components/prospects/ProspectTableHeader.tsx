
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Prospect } from "@/types/prospects";

interface ProspectTableHeaderProps {
  onSort: (key: keyof Prospect) => void;
  sortConfig: {
    key: keyof Prospect;
    direction: 'asc' | 'desc';
  } | null;
}

const ProspectTableHeader = ({ onSort, sortConfig }: ProspectTableHeaderProps) => {
  const renderSortButton = (label: string, key: keyof Prospect) => (
    <Button
      variant="ghost"
      onClick={() => onSort(key)}
      className="h-8 px-2 lg:px-3"
    >
      {label}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );

  return (
    <TableHeader className="sticky top-0 bg-white z-10">
      <TableRow>
        <TableHead className="w-[200px] min-w-[200px] sticky left-0 bg-white z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
          {renderSortButton("Business Name", "business_name")}
        </TableHead>
        <TableHead className="min-w-[100px]">Notes</TableHead>
        <TableHead>{renderSortButton("Territory", "territory")}</TableHead>
        <TableHead>{renderSortButton("Website", "website")}</TableHead>
        <TableHead>{renderSortButton("Email", "email")}</TableHead>
        <TableHead>{renderSortButton("Address", "business_address")}</TableHead>
        <TableHead>{renderSortButton("Location Type", "location_type")}</TableHead>
        <TableHead>{renderSortButton("Phone", "phone_number")}</TableHead>
        <TableHead>{renderSortButton("Rating", "rating")}</TableHead>
        <TableHead>{renderSortButton("Reviews", "review_count")}</TableHead>
        <TableHead>{renderSortButton("Status", "status")}</TableHead>
        <TableHead>{renderSortButton("Priority", "priority")}</TableHead>
        <TableHead>{renderSortButton("Owner Name", "owner_name")}</TableHead>
        <TableHead>{renderSortButton("Owner Phone", "owner_phone")}</TableHead>
        <TableHead>{renderSortButton("Owner Email", "owner_email")}</TableHead>
        <TableHead>{renderSortButton("Last Contact", "last_contact")}</TableHead>
        <TableHead>AI Insights</TableHead>
        <TableHead>Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default ProspectTableHeader;
