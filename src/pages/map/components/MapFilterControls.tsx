
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
    <div className="absolute left-4 top-4 z-10 w-72">
      <div className="bg-white p-3 rounded-lg shadow-lg space-y-3">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search prospects..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select
          value={selectedTerritory}
          onValueChange={setSelectedTerritory}
        >
          <SelectTrigger className="w-full">
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
      </div>
    </div>
  );
};

export default MapFilterControls;
