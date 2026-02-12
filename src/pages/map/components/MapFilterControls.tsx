
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MapFilterControlsProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedTerritory: string;
  setSelectedTerritory: (value: string) => void;
  territories: string[];
}

const MapFilterControls = ({
  searchTerm,
  setSearchTerm,
  selectedTerritory,
  setSelectedTerritory,
  territories
}: MapFilterControlsProps) => {
  return (
    <>
      <div className="relative w-56">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search prospects..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8 h-9"
        />
      </div>
      <Select
        value={selectedTerritory}
        onValueChange={setSelectedTerritory}
      >
        <SelectTrigger className="w-44 h-9">
          <SelectValue placeholder="Filter by Territory" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Territories</SelectItem>
          {territories.map((territory) => (
            <SelectItem key={territory} value={territory}>
              {territory}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
};

export default MapFilterControls;
