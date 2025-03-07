
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Territory } from "@/hooks/useTerritories";

interface BusinessInfoProps {
  businessName: string;
  website: string;
  email: string;
  businessAddress: string;
  phoneNumber: string;
  rating: string;
  reviewCount: string;
  territory: string;
  territories?: Territory[];
  locationType?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLocationTypeChange?: (value: string) => void;
  onTerritoryChange?: (value: string) => void;
}

const BusinessInfoFields = ({
  businessName,
  website,
  email,
  businessAddress,
  phoneNumber,
  rating,
  reviewCount,
  territory,
  territories = [],
  locationType = 'Business',
  onChange,
  onLocationTypeChange,
  onTerritoryChange
}: BusinessInfoProps) => {
  return (
    <>
      <div>
        <Label htmlFor="business_name">Business Name *</Label>
        <Input
          id="business_name"
          name="business_name"
          value={businessName}
          onChange={onChange}
          required
        />
      </div>
      <div className="relative z-50">
        <Label htmlFor="territory">Territory</Label>
        {territories.length > 0 ? (
          <Select
            value={territory}
            onValueChange={onTerritoryChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a territory">
                {territory || "Select a territory"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent 
              position="popper" 
              className="z-[100]"
              sideOffset={5}
              align="start"
            >
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
        ) : (
          <Input
            id="territory"
            name="territory"
            value={territory}
            onChange={onChange}
          />
        )}
      </div>
      <div>
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          name="website"
          value={website}
          onChange={onChange}
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="text"
          inputMode="email"
          pattern={email ? "[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$" : ".*"}
          value={email}
          onChange={onChange}
        />
      </div>
      <div>
        <Label htmlFor="business_address">Business Address</Label>
        <Input
          id="business_address"
          name="business_address"
          value={businessAddress}
          onChange={onChange}
        />
      </div>
      <div className="space-y-2">
        <Label>Location Type</Label>
        <RadioGroup
          defaultValue={locationType}
          onValueChange={onLocationTypeChange}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Business" id="business" />
            <Label htmlFor="business">Business</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Home" id="home" />
            <Label htmlFor="home">Home</Label>
          </div>
        </RadioGroup>
      </div>
      <div>
        <Label htmlFor="phone_number">Phone Number</Label>
        <Input
          id="phone_number"
          name="phone_number"
          value={phoneNumber}
          onChange={onChange}
        />
      </div>
      <div>
        <Label htmlFor="rating">Rating (0.0 - 5.0)</Label>
        <Input
          id="rating"
          name="rating"
          type="number"
          min="0"
          max="5"
          step="0.1"
          value={rating}
          onChange={onChange}
        />
      </div>
      <div>
        <Label htmlFor="review_count">Review Count</Label>
        <Input
          id="review_count"
          name="review_count"
          type="number"
          min="0"
          value={reviewCount}
          onChange={onChange}
        />
      </div>
    </>
  );
};

export default BusinessInfoFields;
