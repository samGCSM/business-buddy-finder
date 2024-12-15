import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SheetFooter } from "@/components/ui/sheet";

interface NotesInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSave: () => void;
}

const NotesInput = ({ value, onChange, onSave }: NotesInputProps) => {
  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Add a new note..."
        value={value}
        onChange={onChange}
        className="min-h-[100px]"
      />
      <SheetFooter>
        <Button onClick={onSave}>Save Note</Button>
      </SheetFooter>
    </div>
  );
};

export default NotesInput;