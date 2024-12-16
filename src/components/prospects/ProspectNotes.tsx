import { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ActivityLog from "./notes/ActivityLog";
import NotesTabContent from "./notes/NotesTabContent";
import { useActivityLog, setupNotificationListener } from "./notes/useActivityLog";
import { ActivityLogItemData } from "./notes/ActivityLogItem";
import { getCurrentUser } from "@/services/userService";

interface ProspectNotesProps {
  prospectId: string;
  existingNotes: string;
  onNotesUpdated: () => void;
}

const ProspectNotes = ({ prospectId, existingNotes, onNotesUpdated }: ProspectNotesProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [activityLog, setActivityLog] = useState<ActivityLogItemData[]>([]);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const { handleFileUpload, addNote, isUploading, getActivityLog } = useActivityLog(prospectId, onNotesUpdated);

  useEffect(() => {
    const initializeNotifications = async () => {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        const cleanup = setupNotificationListener(currentUser.id, () => {
          setHasNewNotification(true);
          if (isOpen) {
            refreshActivityLog();
          }
        });
        return cleanup;
      }
    };

    initializeNotifications();
  }, [prospectId]);

  useEffect(() => {
    if (isOpen) {
      refreshActivityLog();
    }
  }, [isOpen]);

  const refreshActivityLog = async () => {
    const updatedLog = await getActivityLog();
    setActivityLog(updatedLog);
    setHasNewNotification(false);
  };

  const handleSaveNote = async () => {
    const success = await addNote(newNote, existingNotes);
    if (success) {
      setNewNote("");
      refreshActivityLog();
    }
  };

  const getNoteCount = () => {
    if (!existingNotes) return 0;
    return existingNotes.split('[').length - 1;
  };

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
          {hasNewNotification && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </Button>
        {getNoteCount() > 0 && (
          <Badge 
            variant="secondary" 
            className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center rounded-full text-xs"
          >
            {getNoteCount()}
          </Badge>
        )}
      </div>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Notes & Activity</SheetTitle>
          </SheetHeader>
          
          <div className="flex flex-col h-full gap-4 mt-4">
            <Tabs defaultValue="notes" className="flex-1">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="activity">Activity Log</TabsTrigger>
              </TabsList>
              
              <TabsContent value="notes">
                <NotesTabContent
                  existingNotes={existingNotes}
                  newNote={newNote}
                  isUploading={isUploading}
                  onNoteChange={(e) => setNewNote(e.target.value)}
                  onNoteSave={handleSaveNote}
                  onFileUpload={handleFileUpload}
                />
              </TabsContent>
              
              <TabsContent value="activity" className="flex-1">
                <ActivityLog items={activityLog} />
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ProspectNotes;