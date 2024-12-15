import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NotesFieldProps {
  notes: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const NotesField = ({ notes, onChange }: NotesFieldProps) => {
  return (
    <div>
      <Label htmlFor="notes">Notes</Label>
      <Input
        id="notes"
        name="notes"
        value={notes}
        onChange={onChange}
      />
    </div>
  );
};

export default NotesField;