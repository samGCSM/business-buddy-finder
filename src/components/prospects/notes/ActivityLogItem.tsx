import { MessageSquare, FileText, Image as ImageIcon } from "lucide-react";

export type ActivityLogItemType = 'note' | 'file' | 'image';

export interface ActivityLogItemData {
  type: ActivityLogItemType;
  content: string;
  timestamp: string;
  fileUrl?: string;
  fileName?: string;
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
      <div>
        <p className="text-gray-600">{item.content}</p>
        <p className="text-xs text-gray-400">
          {new Date(item.timestamp).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default ActivityLogItem;