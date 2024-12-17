import { useSession } from '@supabase/auth-helpers-react';
import ProspectFormFields from "./ProspectFormFields";
import ProspectFormContainer from "./form/ProspectFormContainer";
import ProspectFormActions from "./form/ProspectFormActions";
import { useProspectForm } from "./hooks/useProspectForm";

interface AddProspectFormProps {
  onClose: () => void;
  onSuccess: () => void;
  userRole: 'admin' | 'supervisor' | 'user' | null;
}

const AddProspectForm = ({ onClose, onSuccess, userRole }: AddProspectFormProps) => {
  const session = useSession();
  const { 
    formData, 
    handleChange, 
    handleSubmit,
    handleStatusChange,
    handlePriorityChange 
  } = useProspectForm(onSuccess);

  return (
    <ProspectFormContainer title="Add New Prospect" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <ProspectFormFields 
          formData={formData} 
          handleChange={handleChange}
          onStatusChange={handleStatusChange}
          onPriorityChange={handlePriorityChange}
        />
        <ProspectFormActions 
          onClose={onClose}
          submitLabel="Add Prospect"
        />
      </form>
    </ProspectFormContainer>
  );
};

export default AddProspectForm;