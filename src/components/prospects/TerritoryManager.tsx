
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useTerritories } from "@/hooks/useTerritories";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";

interface TerritoryManagerProps {
  userId: number;
}

const TerritoryManager = ({ userId }: TerritoryManagerProps) => {
  const [open, setOpen] = useState(false);
  const [newTerritory, setNewTerritory] = useState("");
  const { territories, isLoading, fetchTerritories, addTerritory, updateTerritory } = useTerritories();

  useEffect(() => {
    if (open && userId) {
      console.log('Dialog opened, fetching territories for user:', userId);
      fetchTerritories(userId);
    }
  }, [open, userId, fetchTerritories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTerritory.trim()) return;

    const success = await addTerritory(newTerritory.trim(), userId);
    if (success) {
      setNewTerritory("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <MapPin className="h-4 w-4" />
          Manage Territories
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage Territories</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={newTerritory}
              onChange={(e) => setNewTerritory(e.target.value)}
              placeholder="Enter new territory name"
            />
            <Button type="submit" disabled={!newTerritory.trim()}>
              Add
            </Button>
          </form>
          
          {isLoading ? (
            <div>Loading territories...</div>
          ) : (
            <div className="space-y-4">
              {territories.length === 0 ? (
                <div className="text-center text-gray-500">
                  No territories added yet
                </div>
              ) : (
                territories.map((territory) => (
                  <div key={territory.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={territory.id}>{territory.name}</Label>
                    </div>
                    <Switch
                      id={territory.id}
                      checked={territory.active}
                      onCheckedChange={(checked) => updateTerritory(territory.id, checked)}
                    />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TerritoryManager;
