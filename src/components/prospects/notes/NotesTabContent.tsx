
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getCurrentUser } from "@/services/userService";
import { useEffect, useState, useRef } from "react";
import { ActivityLogItemData } from "./ActivityLogItem";
import FileUpload from "./FileUpload";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, ThumbsUp } from "lucide-react";
import { updateActivityLogLikes } from "./useActivityLogStorage";

interface NotesTabContentProps {
  existingNotes: string;
  newNote: string;
  isUploading: boolean;
  onNoteChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onNoteSave: () => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  activityLog: ActivityLogItemData[];
  onReply: (parentItem: ActivityLogItemData) => void;
  prospectId: string;
}

const NotesTabContent = ({
  existingNotes,
  newNote,
  isUploading,
  onNoteChange,
  onNoteSave,
  onFileUpload,
  activityLog,
  onReply,
  prospectId
}: NotesTabContentProps) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [likeStates, setLikeStates] = useState<{ [key: string]: boolean }>({});
  const [likeCounts, setLikeCounts] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    // Initialize like counts from activity log
    const initialLikeCounts: { [key: string]: number } = {};
    const initialLikeStates: { [key: string]: boolean } = {};
    
    activityLog.forEach(item => {
      initialLikeCounts[item.timestamp] = item.likes || 0;
      initialLikeStates[item.timestamp] = false;
    });
    
    setLikeCounts(initialLikeCounts);
    setLikeStates(initialLikeStates);
  }, [activityLog]);

  const handleLike = async (item: ActivityLogItemData) => {
    try {
      const isCurrentlyLiked = likeStates[item.timestamp] || false;
      const currentCount = likeCounts[item.timestamp] || 0;
      const newLikeCount = isCurrentlyLiked ? currentCount - 1 : currentCount + 1;
      
      const success = await updateActivityLogLikes(prospectId, item.timestamp, newLikeCount);
      
      if (success) {
        setLikeCounts(prev => ({
          ...prev,
          [item.timestamp]: newLikeCount
        }));
        setLikeStates(prev => ({
          ...prev,
          [item.timestamp]: !isCurrentlyLiked
        }));
      }
    } catch (error) {
      console.error('Error updating likes:', error);
    }
  };

  // Split existing notes into paragraphs for better readability
  const notesParagraphs = existingNotes ? existingNotes.split('\n').filter(Boolean) : [];

  return (
    <div className="flex flex-col h-[calc(100vh-250px)]">
      <ScrollArea className="flex-1 pr-4">
        {/* Display existing notes */}
        {notesParagraphs.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Notes</h3>
            <div className="space-y-2">
              {notesParagraphs.map((note, index) => (
                <p key={index} className="text-sm text-gray-700">{note}</p>
              ))}
            </div>
          </div>
        )}

        {/* Display activity log */}
        {activityLog.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-2">Activity Log</h3>
            {activityLog.map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8">
                    <div className="bg-primary text-white w-full h-full flex items-center justify-center text-sm">
                      {item.userEmail?.[0]?.toUpperCase()}
                    </div>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-blue-600">
                        {item.userEmail} ({item.userType})
                      </p>
                      <span className="text-xs text-gray-500">
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{item.content}</p>
                  </div>
                </div>
                <div className="ml-11 flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`h-7 px-2 text-xs flex items-center gap-1 ${likeStates[item.timestamp] ? 'text-blue-600' : ''}`}
                    onClick={() => handleLike(item)}
                  >
                    <ThumbsUp className={`h-3 w-3 ${likeStates[item.timestamp] ? 'fill-current' : ''}`} />
                    {likeCounts[item.timestamp] > 0 && `(${likeCounts[item.timestamp]})`}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 px-2 text-xs flex items-center gap-1"
                    onClick={() => onReply(item)}
                  >
                    <MessageSquare className="h-3 w-3" />
                    Reply
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="border-t pt-4 space-y-4 mt-4">
        <FileUpload 
          onFileUpload={onFileUpload}
          isUploading={isUploading}
        />

        <div className="space-y-2">
          <Textarea
            placeholder="Write a reply and mention others with @..."
            value={newNote}
            onChange={onNoteChange}
            className="min-h-[100px]"
          />
          <div className="flex justify-end">
            <Button onClick={onNoteSave}>Update</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotesTabContent;
