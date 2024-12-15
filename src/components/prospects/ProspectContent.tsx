import { useState } from "react";
import ProspectsTable from "./ProspectsTable";
import AddProspectForm from "./AddProspectForm";
import ProspectHeader from "./ProspectHeader";

interface Prospect {
  id: string;
  business_name: string;
  notes: string;
  website: string;
  email: string;
  business_address: string;
  phone_number: string;
  owner_name: string;
  status: string;
  priority: string;
  owner_phone: string;
  owner_email: string;
  last_contact: string;
}

interface ProspectContentProps {
  prospects: Prospect[];
  showAddForm: boolean;
  onAddFormClose: () => void;
  onProspectAdded: () => void;
}

const ProspectContent = ({ 
  prospects, 
  showAddForm, 
  onAddFormClose, 
  onProspectAdded 
}: ProspectContentProps) => {
  const [isAddFormVisible, setIsAddFormVisible] = useState(showAddForm);

  const handleAddClick = () => {
    setIsAddFormVisible(true);
  };

  return (
    <div className="space-y-6">
      <ProspectHeader 
        onAddClick={handleAddClick}
        onBulkUploadSuccess={onProspectAdded}
        prospects={prospects}
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