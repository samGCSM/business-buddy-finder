import NotesDisplay from "./NotesDisplay";
import FileUpload from "./FileUpload";
import NotesInput from "./NotesInput";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getCurrentUser } from "@/services/userService";
import { useEffect, useState } from "react";

interface NotesTabContentProps {
  existingNotes: string;
  newNote: string;
  isUploading: boolean;
  onNoteChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onNoteSave: () => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  activityLog: any[];
}

const NotesTabContent = ({
  existingNotes,
  newNote,
  isUploading,
  onNoteChange,
  onNoteSave,
  onFileUpload,
  activityLog
}: NotesTabContentProps) => {
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
    };
    fetchUser();
  }, []);

  return (
    <div className="flex flex-col flex-1 space-y-4">
      <div className="flex-1 space-y-4">
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
              <Button variant="ghost" size="sm" className="text-xs">
                Like
              </Button>
              <Button variant="ghost" size="sm" className="text-xs">
                Reply
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-4 space-y-4">
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