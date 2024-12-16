import { ScrollArea } from "@/components/ui/scroll-area";
import ActivityLogItem, { ActivityLogItemData } from "./ActivityLogItem";

interface ActivityLogProps {
  items: ActivityLogItemData[];
  prospectId: string;
  onReply: (parentItem: ActivityLogItemData) => void;
}

const ActivityLog = ({ items, prospectId, onReply }: ActivityLogProps) => {
  return (
    <ScrollArea className="flex-grow h-[calc(100vh-250px)]">
      <div className="space-y-4 pr-4">
        {items.length === 0 ? (
          <p className="text-sm text-gray-500">No activity yet</p>
        ) : (
          <div className="space-y-2">
            {items.map((item, index) => (
              <ActivityLogItem 
                key={index} 
                item={item} 
                prospectId={prospectId}
                onReply={onReply}
              />
            ))}
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default ActivityLog;