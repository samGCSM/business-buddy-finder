
import { TableCell } from "@/components/ui/table";
import { useTerritorySelect } from "@/hooks/useTerritorySelect";
import type { Territory } from "@/hooks/useTerritories";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TerritorySelectCellProps {
  prospectId: string;
  territory: string | null;
  territories: Territory[];
  onUpdate: () => void;
}

const TerritorySelectCell = ({ 
  prospectId, 
  territory, 
  territories, 
  onUpdate 
}: TerritorySelectCellProps) => {
  const { currentTerritory, handleTerritoryChange } = useTerritorySelect({
    initialTerritory: territory,
    prospectId,
    onUpdate
  });

  return (
    <TableCell>
      <Select
        value={currentTerritory}
        onValueChange={handleTerritoryChange}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select a territory">
            {currentTerritory || "Select a territory"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {territories.map((territory) => (
            <SelectItem 
              key={territory.id} 
              value={territory.name}
              disabled={!territory.active}
            >
              {territory.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </TableCell>
  );
};

export default TerritorySelectCell;
