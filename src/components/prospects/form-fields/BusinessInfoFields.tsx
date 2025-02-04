import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface BusinessInfoProps {
  businessName: string;
  website: string;
  email: string;
  businessAddress: string;
  phoneNumber: string;
  rating: string;
  reviewCount: string;
  territory: string;
  locationType?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLocationTypeChange?: (value: string) => void;
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
  locationType = 'Business',
  onChange,
  onLocationTypeChange
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
      <div>
        <Label htmlFor="territory">Territory</Label>
        <Input
          id="territory"
          name="territory"
          value={territory}
          onChange={onChange}
        />
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
          type="email"
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