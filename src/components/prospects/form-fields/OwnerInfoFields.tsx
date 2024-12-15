import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface OwnerInfoProps {
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const OwnerInfoFields = ({
  ownerName,
  ownerPhone,
  ownerEmail,
  onChange
}: OwnerInfoProps) => {
  return (
    <>
      <div>
        <Label htmlFor="owner_name">Owner Name</Label>
        <Input
          id="owner_name"
          name="owner_name"
          value={ownerName}
          onChange={onChange}
        />
      </div>
      <div>
        <Label htmlFor="owner_phone">Owner Phone</Label>
        <Input
          id="owner_phone"
          name="owner_phone"
          value={ownerPhone}
          onChange={onChange}
        />
      </div>
      <div>
        <Label htmlFor="owner_email">Owner Email</Label>
        <Input
          id="owner_email"
          name="owner_email"
          type="email"
          value={ownerEmail}
          onChange={onChange}
        />
      </div>
    </>
  );
};

export default OwnerInfoFields;