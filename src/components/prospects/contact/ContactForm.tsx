import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PhoneCall, Mail, MessageSquare, User } from "lucide-react";
import { format } from "date-fns";
import { ContactType, ContactFormProps } from "./types";

export const ContactForm = ({ onSubmit }: ContactFormProps) => {
  const [selectedType, setSelectedType] = useState<ContactType | null>(null);
  const [contactDate, setContactDate] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  const [notes, setNotes] = useState("");

  const contactTypes = [
    { type: 'Phone Call' as ContactType, icon: PhoneCall },
    { type: 'Email' as ContactType, icon: Mail },
    { type: 'Text Message' as ContactType, icon: MessageSquare },
    { type: 'Face to Face' as ContactType, icon: User },
  ];

  const handleSubmit = () => {
    if (!selectedType) return;
    
    onSubmit({
      type: selectedType,
      timestamp: new Date(contactDate).toISOString(),
      notes,
    });

    setSelectedType(null);
    setContactDate(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
    setNotes("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-2">Contact Type</h3>
        <div className="grid grid-cols-2 gap-4">
          {contactTypes.map(({ type, icon: Icon }) => (
            <Button
              key={type}
              variant={selectedType === type ? "default" : "outline"}
              className="flex items-center gap-2 h-12"
              onClick={() => setSelectedType(type)}
            >
              <Icon className="h-4 w-4" />
              {type}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Contact Date & Time</h3>
        <input
          type="datetime-local"
          value={contactDate}
          onChange={(e) => setContactDate(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
        />
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Notes</h3>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Enter details about the contact..."
          className="min-h-[100px]"
        />
      </div>

      <Button
        className="w-full"
        onClick={handleSubmit}
        disabled={!selectedType}
      >
        Log Contact
      </Button>
    </div>
  );
};