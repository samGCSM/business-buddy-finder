import { ScrollArea } from "@/components/ui/scroll-area";
import ActivityLogItem, { ActivityLogItemData } from "./ActivityLogItem";

interface ActivityLogProps {
  items: ActivityLogItemData[];
}

const ActivityLog = ({ items }: ActivityLogProps) => {
  return (
    <ScrollArea className="flex-grow">
      <div className="space-y-4">
        <h3 className="font-medium text-sm">Activity Log</h3>
        <div className="space-y-2">
          {items.map((item, index) => (
            <ActivityLogItem key={index} item={item} />
          ))}
        </div>
      </div>
    </ScrollArea>
  );
};

export default ActivityLog;