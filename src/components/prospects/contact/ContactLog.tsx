
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ContactLogProps, ContactHistoryItem, ContactType } from "./types";
import { ContactHistory } from "./ContactHistory";
import { ContactForm } from "./ContactForm";
import { Json } from "@/integrations/supabase/types";
import { ScrollArea } from "@/components/ui/scroll-area";

export const ContactLog = ({ 
  isOpen, 
  onClose, 
  prospectId, 
  prospectName, 
  onContactLogged 
}: ContactLogProps) => {
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
        .filter((item: any) => 
          typeof item === 'object' && 
          item !== null && 
          'type' in item && 
          (item.type === 'Phone Call' || 
           item.type === 'Email' || 
           item.type === 'Text Message' || 
           item.type === 'Face to Face')
        )
        .map((item: any) => ({
          type: item.type as ContactType,
          timestamp: item.timestamp,
          notes: item.notes
        })) as ContactHistoryItem[];

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

  const handleContactSubmit = async (contact: ContactHistoryItem) => {
    try {
      const { data: currentData } = await supabase
        .from('prospects')
        .select('activity_log')
        .eq('id', prospectId)
        .single();

      const updatedLog = [...(currentData?.activity_log || []), contact] as Json[];

      const { error } = await supabase
        .from('prospects')
        .update({
          last_contact: contact.timestamp,
          activity_log: updatedLog
        })
        .eq('id', prospectId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Contact logged successfully",
      });

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
      <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-hidden flex flex-col">
        <SheetHeader>
          <SheetTitle>{prospectName}</SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="flex-1 mt-6">
          <div className="pr-4">
            <ContactForm onSubmit={handleContactSubmit} />
            <ContactHistory contactHistory={contactHistory} />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
