
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { formatISO } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ContactFormProps, ContactType } from "./types";

export const ContactForm = ({ onSubmit }: ContactFormProps) => {
  const [notes, setNotes] = useState("");
  const [contactType, setContactType] = useState<ContactType>("Phone Call");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) return;

    onSubmit({
      type: contactType,
      timestamp: formatISO(new Date()),
      notes,
    });

    setNotes("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="contact-type" className="block text-sm font-medium mb-1">
          Contact Type
        </label>
        <Select
          value={contactType}
          onValueChange={(value) => setContactType(value as ContactType)}
        >
          <SelectTrigger id="contact-type">
            <SelectValue placeholder="Select contact type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Phone Call">Phone Call</SelectItem>
            <SelectItem value="Email">Email</SelectItem>
            <SelectItem value="Text Message">Text Message</SelectItem>
            <SelectItem value="Face to Face">Face to Face</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium mb-1">
          Notes
        </label>
        <Textarea
          id="notes"
          placeholder="Enter contact notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
        />
      </div>

      <Button type="submit" className="w-full">
        Log Contact
      </Button>
    </form>
  );
};
