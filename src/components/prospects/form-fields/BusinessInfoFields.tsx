import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BusinessInfoProps {
  businessName: string;
  website: string;
  email: string;
  businessAddress: string;
  phoneNumber: string;
  rating: string;
  reviewCount: string;
  territory: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
  onChange
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