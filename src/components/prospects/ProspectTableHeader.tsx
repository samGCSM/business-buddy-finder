import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ProspectTableHeader = () => (
  <TableHeader className="sticky top-0 bg-white z-10">
    <TableRow>
      <TableHead className="w-[200px] min-w-[200px] sticky left-0 bg-white z-20">Business Name</TableHead>
      <TableHead className="min-w-[100px]">Notes</TableHead>
      <TableHead>Website</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Address</TableHead>
      <TableHead>Phone</TableHead>
      <TableHead>Owner Name</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Priority</TableHead>
      <TableHead>Owner Phone</TableHead>
      <TableHead>Owner Email</TableHead>
      <TableHead>Last Contact</TableHead>
      <TableHead>Actions</TableHead>
    </TableRow>
  </TableHeader>
);

export default ProspectTableHeader;