import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NotificationCountProps {
  count: number;
  hasNew: boolean;
  onClick: () => void;
}

const NotificationCount = ({ count, hasNew, onClick }: NotificationCountProps) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={onClick}
    >
      <Bell className="h-5 w-5" />
      {hasNew && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
      )}
      {count > 0 && (
        <Badge 
          variant="secondary" 
          className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center rounded-full text-xs"
        >
          {count}
        </Badge>
      )}
    </Button>
  );
};

export default NotificationCount;