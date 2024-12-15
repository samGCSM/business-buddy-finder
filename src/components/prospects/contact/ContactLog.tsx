import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PhoneCall, Mail, MessageSquare, User } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";

interface ContactLogProps {
  isOpen: boolean;
  onClose: () => void;
  prospectId: string;
  prospectName: string;
  onContactLogged: () => void;
}

type ContactType = 'Phone Call' | 'Email' | 'Text Message' | 'Face to Face';

interface ContactHistoryItem {
  type: ContactType;
  timestamp: string;
  notes: string;
}

export const ContactLog = ({ isOpen, onClose, prospectId, prospectName, onContactLogged }: ContactLogProps) => {
  const [selectedType, setSelectedType] = useState<ContactType | null>(null);
  const [contactDate, setContactDate] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  const [notes, setNotes] = useState("");
  const [contactHistory, setContactHistory] = useState<ContactHistoryItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchContactHistory();
    }
  }, [isOpen, prospectId]);

  const fetchContactHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('prospects')
        .select('activity_log')
        .eq('id', prospectId)
        .single();

      if (error) throw error;

      const history = (data?.activity_log || [])
        .filter((item: Json) => 
          typeof item === 'object' && 
          item !== null && 
          'type' in item && 
          (item.type === 'Phone Call' || 
           item.type === 'Email' || 
           item.type === 'Text Message' || 
           item.type === 'Face to Face')
        )
        .map((item: Json) => ({
          type: item.type as ContactType,
          timestamp: item.timestamp as string,
          notes: item.notes as string
        }));

      setContactHistory(history);
    } catch (error) {
      console.error('Error fetching contact history:', error);
      toast({
        title: "Error",
        description: "Failed to fetch contact history",
        variant: "destructive",
      });
    }
  };

  const contactTypes = [
    { type: 'Phone Call' as ContactType, icon: PhoneCall },
    { type: 'Email' as ContactType, icon: Mail },
    { type: 'Text Message' as ContactType, icon: MessageSquare },
    { type: 'Face to Face' as ContactType, icon: User },
  ];

  const handleContactTypeClick = (type: ContactType) => {
    setSelectedType(type);
  };

  const handleLogContact = async () => {
    if (!selectedType) {
      toast({
        title: "Error",
        description: "Please select a contact type",
        variant: "destructive",
      });
      return;
    }

    try {
      const newContact = {
        type: selectedType,
        timestamp: new Date(contactDate).toISOString(),
        notes: notes,
      };

      const { data: currentData } = await supabase
        .from('prospects')
        .select('activity_log')
        .eq('id', prospectId)
        .single();

      const updatedLog = [...(currentData?.activity_log || []), newContact];

      const { error } = await supabase
        .from('prospects')
        .update({
          last_contact: newContact.timestamp,
          activity_log: updatedLog
        })
        .eq('id', prospectId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Contact logged successfully",
      });

      setSelectedType(null);
      setContactDate(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
      setNotes("");
      onContactLogged();
      onClose();
    } catch (error) {
      console.error('Error logging contact:', error);
      toast({
        title: "Error",
        description: "Failed to log contact",
        variant: "destructive",
      });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>{prospectName}</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Contact Type</h3>
          <div className="grid grid-cols-2 gap-4">
            {contactTypes.map(({ type, icon: Icon }) => (
              <Button
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                className="flex items-center gap-2 h-12"
                onClick={() => handleContactTypeClick(type)}
              >
                <Icon className="h-4 w-4" />
                {type}
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Contact Date & Time</h3>
          <input
            type="datetime-local"
            value={contactDate}
            onChange={(e) => setContactDate(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
          />
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Notes</h3>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter details about the contact..."
            className="min-h-[100px]"
          />
        </div>

        <Button
          className="w-full mt-6"
          onClick={handleLogContact}
          disabled={!selectedType}
        >
          Log Contact
        </Button>

        <div className="mt-8">
          <h3 className="font-semibold mb-4">Contact History</h3>
          <div className="space-y-4">
            {contactHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">No contact history yet</p>
            ) : (
              contactHistory.map((contact, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div className="font-medium">{contact.type}</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(contact.timestamp), "MMM d, yyyy h:mm a")}
                    </div>
                  </div>
                  {contact.notes && (
                    <p className="text-sm mt-2 text-muted-foreground">{contact.notes}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};