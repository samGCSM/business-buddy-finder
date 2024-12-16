import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface NotificationIndicatorProps {
  hasNewNotification: boolean;
  noteCount: number;
}

const NotificationIndicator = ({ hasNewNotification, noteCount }: NotificationIndicatorProps) => {
  return (
    <div className="relative inline-flex items-center">
      {hasNewNotification && (
        <div className="absolute -top-1 -right-1">
          <Bell className="h-3 w-3 text-red-500" />
        </div>
      )}
      {noteCount > 0 && (
        <Badge 
          variant="secondary" 
          className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center rounded-full text-xs"
        >
          {noteCount}
        </Badge>
      )}
    </div>
  );
};

export default NotificationIndicator;