import { useState } from "react";
import ProspectsTable from "./ProspectsTable";
import AddProspectForm from "./AddProspectForm";
import ProspectHeader from "./ProspectHeader";
import UserProspectFilter from "./UserProspectFilter";
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

  const handleAddClick = () => {
    setIsAddFormVisible(true);
  };

  // Allow all users to add prospects
  const canAddProspects = true;

  return (
    <div className="space-y-6">
      {(userRole === 'admin' || userRole === 'supervisor') && supervisedUsers.length > 0 && (
        <UserProspectFilter 
          users={supervisedUsers}
          onUserSelect={onUserSelect}
          currentUser={currentUser}
        />
      )}
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
        prospects={prospects}
        onUpdate={onProspectAdded}
      />
    </div>
  );
};

export default ProspectContent;