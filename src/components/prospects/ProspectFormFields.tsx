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
  rating: string;
  review_count: string;
  territory: string;
  location_type?: string;
}

interface ProspectFormFieldsProps {
  formData: ProspectFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStatusChange?: (value: string) => void;
  onPriorityChange?: (value: string) => void;
  onLocationTypeChange?: (value: string) => void;
}

const ProspectFormFields = ({ 
  formData, 
  handleChange,
  onLocationTypeChange,
}: ProspectFormFieldsProps) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <BusinessInfoFields
        businessName={formData.business_name}
        website={formData.website}
        email={formData.email}
        businessAddress={formData.business_address}
        phoneNumber={formData.phone_number}
        rating={formData.rating}
        reviewCount={formData.review_count}
        territory={formData.territory}
        locationType={formData.location_type}
        onChange={handleChange}
        onLocationTypeChange={onLocationTypeChange}
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