import { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import ActivityLog from "./notes/ActivityLog";
import FileUpload from "./notes/FileUpload";
import NotesInput from "./notes/NotesInput";
import { useActivityLog } from "./notes/useActivityLog";
import { ActivityLogItemData } from "./notes/ActivityLogItem";

interface ProspectNotesProps {
  prospectId: string;
  existingNotes: string;
  onNotesUpdated: () => void;
}

const ProspectNotes = ({ prospectId, existingNotes, onNotesUpdated }: ProspectNotesProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [activityLog, setActivityLog] = useState<ActivityLogItemData[]>([]);
  const { handleFileUpload, addNote, isUploading, getActivityLog } = useActivityLog(prospectId, onNotesUpdated);

  useEffect(() => {
    if (isOpen) {
      getActivityLog().then(setActivityLog);
    }
  }, [isOpen]);

  const handleSaveNote = async () => {
    const success = await addNote(newNote, existingNotes);
    if (success) {
      setNewNote("");
      const updatedLog = await getActivityLog();
      setActivityLog(updatedLog);
    }
  };

  const getNoteCount = () => {
    if (!existingNotes) return 0;
    return existingNotes.split('[').length - 1;
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

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Prospect Notes & Activity</SheetTitle>
          </SheetHeader>
          
          <div className="flex flex-col h-full gap-4 mt-4">
            {existingNotes && (
              <div className="bg-gray-50 p-4 rounded-lg text-sm whitespace-pre-wrap mb-4">
                {existingNotes}
              </div>
            )}
            
            <ActivityLog items={activityLog} />

            <div className="space-y-4">
              <FileUpload 
                onFileUpload={handleFileUpload}
                isUploading={isUploading}
              />

              <NotesInput
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onSave={handleSaveNote}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ProspectNotes;