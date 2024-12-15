import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BusinessInfoProps {
  businessName: string;
  website: string;
  email: string;
  businessAddress: string;
  phoneNumber: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const BusinessInfoFields = ({
  businessName,
  website,
  email,
  businessAddress,
  phoneNumber,
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
    </>
  );
};

export default BusinessInfoFields;