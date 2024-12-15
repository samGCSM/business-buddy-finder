import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
}

interface ProspectFormFieldsProps {
  formData: ProspectFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStatusChange?: (value: string) => void;
  onPriorityChange?: (value: string) => void;
}

const statusOptions = ['New', 'Contacted', 'Meeting', 'Proposal', 'Won', 'Lost'];
const priorityOptions = ['Low', 'Medium', 'High'];

const ProspectFormFields = ({ 
  formData, 
  handleChange,
  onStatusChange,
  onPriorityChange 
}: ProspectFormFieldsProps) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="business_name">Business Name *</Label>
        <Input
          id="business_name"
          name="business_name"
          value={formData.business_name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          name="website"
          value={formData.website}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label htmlFor="business_address">Business Address</Label>
        <Input
          id="business_address"
          name="business_address"
          value={formData.business_address}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label htmlFor="phone_number">Phone Number</Label>
        <Input
          id="phone_number"
          name="phone_number"
          value={formData.phone_number}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label htmlFor="owner_name">Owner Name</Label>
        <Input
          id="owner_name"
          name="owner_name"
          value={formData.owner_name}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label htmlFor="owner_phone">Owner Phone</Label>
        <Input
          id="owner_phone"
          name="owner_phone"
          value={formData.owner_phone}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label htmlFor="owner_email">Owner Email</Label>
        <Input
          id="owner_email"
          name="owner_email"
          type="email"
          value={formData.owner_email}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <Select 
          value={formData.status} 
          onValueChange={(value) => onStatusChange?.(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="priority">Priority</Label>
        <Select 
          value={formData.priority} 
          onValueChange={(value) => onPriorityChange?.(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            {priorityOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
    <div>
      <Label htmlFor="notes">Notes</Label>
      <Input
        id="notes"
        name="notes"
        value={formData.notes}
        onChange={handleChange}
      />
    </div>
  </div>
);

export default ProspectFormFields;