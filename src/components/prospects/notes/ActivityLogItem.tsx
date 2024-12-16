import { MessageSquare, FileText, Image as ImageIcon, ThumbsUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { format } from 'date-fns';
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Json } from '@/integrations/supabase/types';

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
  likes?: number;
  replies?: ActivityLogItemData[];
}

interface ActivityLogItemProps {
  item: ActivityLogItemData;
  prospectId: string;
  onReply: (parentItem: ActivityLogItemData) => void;
}

const ActivityLogItem = ({ item, prospectId, onReply }: ActivityLogItemProps) => {
  const [likes, setLikes] = useState(item.likes || 0);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = async () => {
    try {
      const newLikeCount = isLiked ? likes - 1 : likes + 1;
      setLikes(newLikeCount);
      setIsLiked(!isLiked);

      const { data: prospect } = await supabase
        .from('prospects')
        .select('activity_log')
        .eq('id', prospectId)
        .single();

      if (prospect && prospect.activity_log) {
        const updatedLog = (prospect.activity_log as Json[]).map((logItem) => {
          const typedLogItem = logItem as unknown as ActivityLogItemData;
          if (typedLogItem.timestamp === item.timestamp && typedLogItem.content === item.content) {
            return { ...typedLogItem, likes: newLikeCount };
          }
          return logItem;
        });

        await supabase
          .from('prospects')
          .update({ activity_log: updatedLog })
          .eq('id', prospectId);
      }
    } catch (error) {
      console.error('Error updating likes:', error);
    }
  };

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
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-7 px-2 text-xs ${isLiked ? 'text-blue-600' : ''}`}
            onClick={handleLike}
          >
            <ThumbsUp className="h-3 w-3 mr-1" />
            Like {likes > 0 && `(${likes})`}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2 text-xs"
            onClick={() => onReply(item)}
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            Reply
          </Button>
        </div>
        {item.replies?.map((reply, index) => (
          <div key={index} className="ml-8 mt-2 bg-white p-3 rounded-lg">
            <ActivityLogItem item={reply} prospectId={prospectId} onReply={onReply} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityLogItem;