
import BusinessInfoFields from "./form-fields/BusinessInfoFields";
import OwnerInfoFields from "./form-fields/OwnerInfoFields";
import NotesField from "./form-fields/NotesField";
import { useTerritories } from "@/hooks/useTerritories";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  onTerritoryChange?: (value: string) => void;
  userId?: number;
}

const ProspectFormFields = ({ 
  formData, 
  handleChange,
  onLocationTypeChange,
  onTerritoryChange,
  userId
}: ProspectFormFieldsProps) => {
  const { territories, isLoading } = useTerritories();

  return (
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
      <div className="space-y-2">
        <label htmlFor="territory" className="text-sm font-medium">
          Territory
        </label>
        <Select
          value={formData.territory || ""}
          onValueChange={(value) => onTerritoryChange?.(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a territory" />
          </SelectTrigger>
          <SelectContent>
            {territories.map((territory) => (
              <SelectItem 
                key={territory.id} 
                value={territory.name}
                disabled={!territory.active}
              >
                {territory.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <NotesField
        notes={formData.notes}
        onChange={handleChange}
      />
    </div>
  );
};

export default ProspectFormFields;
