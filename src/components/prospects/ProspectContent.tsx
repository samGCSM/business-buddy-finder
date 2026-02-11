
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const handleAddClick = () => {
    setIsAddFormVisible(true);
  };

  // Get unique territories from prospects
  const territories = Array.from(new Set(prospects.map(p => p.territory).filter(Boolean)));

  // Filter prospects by territory then search
  const territoryFiltered = selectedTerritory === "all"
    ? prospects
    : prospects.filter(p => p.territory === selectedTerritory);

  const filteredProspects = searchQuery.trim()
    ? territoryFiltered.filter(p => {
        const q = searchQuery.toLowerCase();
        return (
          p.business_name?.toLowerCase().includes(q) ||
          p.email?.toLowerCase().includes(q) ||
          p.owner_name?.toLowerCase().includes(q) ||
          p.phone_number?.toLowerCase().includes(q) ||
          p.business_address?.toLowerCase().includes(q)
        );
      })
    : territoryFiltered;

  // Get selected prospects for header actions
  const selectedProspects = filteredProspects.filter(p => selectedIds.has(p.id));

  // Allow all users to add prospects
  const canAddProspects = true;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-wrap">
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
        prospects={filteredProspects}
        selectedProspects={selectedProspects}
        showAddButton={canAddProspects}
        userId={currentUser?.id}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
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
        onSelectionChange={setSelectedIds}
      />
    </div>
  );
};

export default ProspectContent;
