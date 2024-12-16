import { MessageSquare, FileText, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <div className="flex items-start gap-2 text-sm">
      <div className="bg-gray-100 p-2 rounded">
        {getIcon()}
      </div>
      <div className="flex-1">
        {item.userEmail && (
          <p className="text-xs font-medium text-blue-600 mb-1">
            {item.userEmail} ({item.userType})
          </p>
        )}
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
          <p className="text-gray-600">{item.content}</p>
        )}
        <p className="text-xs text-gray-400">
          {format(new Date(item.timestamp), 'MMM d, yyyy h:mm a')}
        </p>
      </div>
    </div>
  );
};

export default ActivityLogItem;