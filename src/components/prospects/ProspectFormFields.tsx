import BusinessInfoFields from "./form-fields/BusinessInfoFields";
import OwnerInfoFields from "./form-fields/OwnerInfoFields";
import NotesField from "./form-fields/NotesField";

interface ProspectFormData {
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
}

interface ProspectFormFieldsProps {
  formData: ProspectFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStatusChange?: (value: string) => void;
  onPriorityChange?: (value: string) => void;
}

const ProspectFormFields = ({ 
  formData, 
  handleChange,
}: ProspectFormFieldsProps) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <BusinessInfoFields
        businessName={formData.business_name}
        website={formData.website}
        email={formData.email}
        businessAddress={formData.business_address}
        phoneNumber={formData.phone_number}
        onChange={handleChange}
      />
      <OwnerInfoFields
        ownerName={formData.owner_name}
        ownerPhone={formData.owner_phone}
        ownerEmail={formData.owner_email}
        onChange={handleChange}
      />
    </div>
    <NotesField
      notes={formData.notes}
      onChange={handleChange}
    />
  </div>
);

export default ProspectFormFields;