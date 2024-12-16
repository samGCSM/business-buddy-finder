import { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import ActivityLog from "./notes/ActivityLog";
import NotesTabContent from "./notes/NotesTabContent";
import NotesHeader from "./notes/NotesHeader";
import NotificationIndicator from "./notes/NotificationIndicator";
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
  const [replyingTo, setReplyingTo] = useState<ActivityLogItemData | null>(null);
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
    const updatedLog = await getActivityLog(prospectId);
    setActivityLog(updatedLog);
    setHasNewNotification(false);
  };

  const handleSaveNote = async () => {
    if (!newNote.trim()) return;

    const success = await addNote(
      newNote, 
      existingNotes,
      replyingTo ? {
        parentTimestamp: replyingTo.timestamp,
        parentContent: replyingTo.content
      } : undefined
    );

    if (success) {
      setNewNote("");
      setReplyingTo(null);
      refreshActivityLog();
    }
  };

  const handleReply = (parentItem: ActivityLogItemData) => {
    setReplyingTo(parentItem);
    setNewNote(`@${parentItem.userEmail} `);
  };

  return (
    <>
      <div className="relative inline-flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(true)}
          className="h-8 w-8 relative"
        >
          <MessageSquare className="h-4 w-4" />
          <NotificationIndicator 
            hasNewNotification={hasNewNotification} 
            noteCount={activityLog.length} 
          />
        </Button>
      </div>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Notes & Activity</SheetTitle>
            {replyingTo && (
              <div className="text-sm text-gray-500">
                Replying to {replyingTo.userEmail}'s note
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setReplyingTo(null);
                    setNewNote("");
                  }}
                  className="ml-2"
                >
                  Cancel
                </Button>
              </div>
            )}
          </SheetHeader>
          
          <div className="flex flex-col h-full gap-4 mt-4">
            <Tabs defaultValue="notes" className="flex-1">
              <NotesHeader />
              
              <TabsContent value="notes" className="flex-1">
                <NotesTabContent
                  existingNotes={existingNotes}
                  newNote={newNote}
                  isUploading={isUploading}
                  onNoteChange={(e) => setNewNote(e.target.value)}
                  onNoteSave={handleSaveNote}
                  onFileUpload={handleFileUpload}
                  activityLog={activityLog}
                  onReply={handleReply}
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