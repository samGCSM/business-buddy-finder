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
  return (
    <div className="space-y-6">
      <ProspectHeader 
        onAddClick={() => showAddForm}
        onBulkUploadSuccess={onProspectAdded}
        prospects={prospects}
      />
      {showAddForm && (
        <AddProspectForm
          onClose={onAddFormClose}
          onSuccess={onProspectAdded}
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