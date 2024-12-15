import { useState } from "react";
import ProspectsTable from "./ProspectsTable";
import AddProspectForm from "./AddProspectForm";
import ProspectHeader from "./ProspectHeader";
import type { Prospect } from "@/types/prospects";

interface ProspectContentProps {
  prospects: Prospect[];
  showAddForm: boolean;
  onAddFormClose: () => void;
  onProspectAdded: () => void;
  userRole: 'admin' | 'supervisor' | 'user' | null;
}

const ProspectContent = ({ 
  prospects, 
  showAddForm, 
  onAddFormClose, 
  onProspectAdded,
  userRole 
}: ProspectContentProps) => {
  const [isAddFormVisible, setIsAddFormVisible] = useState(showAddForm);

  const handleAddClick = () => {
    setIsAddFormVisible(true);
  };

  // Allow all users to add prospects
  const canAddProspects = true;

  return (
    <div className="space-y-6">
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