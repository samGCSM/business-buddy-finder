import { MessageSquare, FileText, Image as ImageIcon, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { format } from "date-fns";

export type ActivityLogItemType = 'note' | 'file' | 'image';

export interface ActivityLogItemData {
  type: ActivityLogItemType;
  content: string;
  timestamp: string;
  fileUrl?: string;
  fileName?: string;
  userId?: number;
  userEmail?: string;
  userType?: string;
}

interface ActivityLogItemProps {
  item: ActivityLogItemData;
}

const ActivityLogItem = ({ item }: ActivityLogItemProps) => {
  const getIcon = () => {
    switch (item.type) {
      case 'note':
        return <MessageSquare className="h-4 w-4" />;
      case 'file':
        return <FileText className="h-4 w-4" />;
      case 'image':
        return <ImageIcon className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex items-start gap-2 text-sm bg-gray-50 p-4 rounded-lg">
      <Avatar className="h-8 w-8">
        <div className="bg-primary text-white w-full h-full flex items-center justify-center text-sm">
          {item.userEmail?.[0]?.toUpperCase()}
        </div>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-medium text-blue-600">
              {item.userEmail} ({item.userType})
            </p>
            {item.fileUrl ? (
              <a 
                href={item.fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {item.content} {item.fileName && `(${item.fileName})`}
              </a>
            ) : (
              <p className="text-gray-700 mt-1">{item.content}</p>
            )}
          </div>
          <span className="text-xs text-gray-500">
            {format(new Date(item.timestamp), 'MMM d, yyyy h:mm a')}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
            <ThumbsUp className="h-3 w-3 mr-1" />
            Like
          </Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
            <MessageSquare className="h-3 w-3 mr-1" />
            Reply
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogItem;