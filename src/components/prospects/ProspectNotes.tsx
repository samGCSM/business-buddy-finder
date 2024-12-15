import { useState } from "react";
import { MessageSquare, Upload, FileText, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Json } from "@/integrations/supabase/types";

interface ProspectNotesProps {
  prospectId: string;
  existingNotes: string;
  onNotesUpdated: () => void;
}

type ActivityLogItemType = 'note' | 'file' | 'image';

interface ActivityLogItem {
  type: ActivityLogItemType;
  content: string;
  timestamp: string;
  fileUrl?: string;
  fileName?: string;
}

const ProspectNotes = ({ prospectId, existingNotes, onNotesUpdated }: ProspectNotesProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${prospectId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('prospect-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('prospect-files')
        .getPublicUrl(filePath);

      const timestamp = new Date().toISOString();
      const fileType = file.type.startsWith('image/') ? 'image' : 'file';
      
      const newLogItem: ActivityLogItem = {
        type: fileType,
        content: `Uploaded ${fileType}: ${file.name}`,
        timestamp,
        fileUrl: publicUrl,
        fileName: file.name
      };

      const currentLog = await getActivityLog();
      const { error: updateError } = await supabase
        .from('prospects')
        .update({ 
          activity_log: [...currentLog, newLogItem as Json],
          last_contact: timestamp
        })
        .eq('id', prospectId);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
      
      onNotesUpdated();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!newNote.trim()) return;

    const timestamp = new Date().toISOString();
    const newLogItem: ActivityLogItem = {
      type: 'note',
      content: newNote,
      timestamp
    };

    try {
      const currentLog = await getActivityLog();
      const { error } = await supabase
        .from('prospects')
        .update({ 
          notes: existingNotes 
            ? `${existingNotes}\n[${new Date().toLocaleString()}] ${newNote}`
            : `[${new Date().toLocaleString()}] ${newNote}`,
          activity_log: [...currentLog, newLogItem as Json],
          last_contact: timestamp
        })
        .eq('id', prospectId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Note added successfully",
      });
      
      setNewNote("");
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

  const getActivityLog = async (): Promise<ActivityLogItem[]> => {
    const { data, error } = await supabase
      .from('prospects')
      .select('activity_log')
      .eq('id', prospectId)
      .single();

    if (error) {
      console.error('Error fetching activity log:', error);
      return [];
    }

    return (data.activity_log || []) as ActivityLogItem[];
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
            <ScrollArea className="flex-grow">
              {existingNotes && (
                <div className="bg-gray-50 p-4 rounded-lg text-sm whitespace-pre-wrap mb-4">
                  {existingNotes}
                </div>
              )}
              
              <div className="space-y-4">
                <h3 className="font-medium text-sm">Activity Log</h3>
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <div className="bg-gray-100 p-2 rounded">
                        <MessageSquare className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-gray-600">Added a note</p>
                        <p className="text-xs text-gray-400">2 hours ago</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>

            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
                <label htmlFor="file-upload">
                  <Button
                    variant="outline"
                    className="gap-2"
                    disabled={isUploading}
                    asChild
                  >
                    <span>
                      <Upload className="h-4 w-4" />
                      {isUploading ? "Uploading..." : "Upload File"}
                    </span>
                  </Button>
                </label>
              </div>

              <Textarea
                placeholder="Add a new note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <SheetFooter>
              <Button onClick={handleSaveNote}>Save Note</Button>
            </SheetFooter>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ProspectNotes;