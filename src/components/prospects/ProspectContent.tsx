import { useState } from "react";
import ProspectsTable from "./ProspectsTable";
import AddProspectForm from "./AddProspectForm";
import ProspectHeader from "./ProspectHeader";
import UserProspectFilter from "./UserProspectFilter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Prospect } from "@/types/prospects";
import type { User } from "@/types/user";

interface ProspectContentProps {
  prospects: Prospect[];
  showAddForm: boolean;
  onAddFormClose: () => void;
  onProspectAdded: () => void;
  userRole: 'admin' | 'supervisor' | 'user' | null;
  currentUser: User | null;
  onUserSelect?: (userId: number) => void;
  supervisedUsers?: User[];
}

const ProspectContent = ({ 
  prospects, 
  showAddForm, 
  onAddFormClose, 
  onProspectAdded,
  userRole,
  currentUser,
  onUserSelect,
  supervisedUsers = []
}: ProspectContentProps) => {
  const [isAddFormVisible, setIsAddFormVisible] = useState(showAddForm);
  const [selectedTerritory, setSelectedTerritory] = useState<string>("all");

  const handleAddClick = () => {
    setIsAddFormVisible(true);
  };

  // Get unique territories from prospects
  const territories = Array.from(new Set(prospects.map(p => p.territory).filter(Boolean)));

  // Filter prospects by territory
  const filteredProspects = selectedTerritory === "all"
    ? prospects
    : prospects.filter(p => p.territory === selectedTerritory);

  // Allow all users to add prospects
  const canAddProspects = true;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {(userRole === 'admin' || userRole === 'supervisor') && supervisedUsers.length > 0 && (
            <UserProspectFilter 
              users={supervisedUsers}
              onUserSelect={onUserSelect}
              currentUser={currentUser}
            />
          )}
          <Select
            value={selectedTerritory}
            onValueChange={setSelectedTerritory}
          >
            <SelectTrigger className="w-[200px]">
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
      <ProspectHeader 
        onAddClick={handleAddClick}
        onBulkUploadSuccess={onProspectAdded}
        prospects={prospects}
        showAddButton={canAddProspects}
      />
      {isAddFormVisible && (
        <AddProspectForm
          onClose={() => {
            setIsAddFormVisible(false);
            onAddFormClose();
          }}
          onSuccess={() => {
            setIsAddFormVisible(false);
            onProspectAdded();
          }}
          userRole={userRole}
        />
      )}
      <ProspectsTable 
        prospects={filteredProspects}
        onUpdate={onProspectAdded}
      />
    </div>
  );
};

export default ProspectContent;