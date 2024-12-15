import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ProspectNotesProps {
  prospectId: string;
  existingNotes: string;
  onNotesUpdated: () => void;
}

const ProspectNotes = ({ prospectId, existingNotes, onNotesUpdated }: ProspectNotesProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newNote, setNewNote] = useState("");

  const getNoteCount = () => {
    if (!existingNotes) return 0;
    return existingNotes.split('[').length - 1;
  };

  const handleSaveNote = async () => {
    if (!newNote.trim()) return;

    const timestamp = new Date().toISOString();
    const updatedNotes = existingNotes 
      ? `${existingNotes}\n[${new Date().toLocaleString()}] ${newNote}`
      : `[${new Date().toLocaleString()}] ${newNote}`;

    try {
      const { error } = await supabase
        .from('prospects')
        .update({ 
          notes: updatedNotes,
          last_contact: timestamp
        })
        .eq('id', prospectId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Note added successfully",
      });
      
      setNewNote("");
      setIsOpen(false);
      onNotesUpdated();
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        title: "Error",
        description: "Failed to save note",
        variant: "destructive",
      });
    }
  };

  const noteCount = getNoteCount();

  return (
    <>
      <div className="relative inline-flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(true)}
          className="h-8 w-8"
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
        {noteCount > 0 && (
          <Badge 
            variant="secondary" 
            className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center rounded-full text-xs"
          >
            {noteCount}
          </Badge>
        )}
      </div>

      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm">
            <DrawerHeader>
              <DrawerTitle>Prospect Notes</DrawerTitle>
            </DrawerHeader>
            
            <div className="p-4 space-y-4">
              {existingNotes && (
                <div className="bg-gray-50 p-4 rounded-lg text-sm whitespace-pre-wrap">
                  {existingNotes}
                </div>
              )}
              
              <Textarea
                placeholder="Add a new note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <DrawerFooter>
              <Button onClick={handleSaveNote}>Save Note</Button>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default ProspectNotes;