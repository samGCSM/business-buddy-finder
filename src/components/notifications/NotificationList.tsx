import { ScrollArea } from "@/components/ui/scroll-area";
import NotificationMessage from "./NotificationMessage";

interface NotificationListProps {
  notifications: any[];
}

const NotificationList = ({ notifications }: NotificationListProps) => {
  return (
    <ScrollArea className="h-[calc(100vh-200px)]">
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <p className="text-gray-500">No notifications</p>
        ) : (
          notifications.map((notification: any, index: number) => (
            <NotificationMessage 
              key={index}
              notification={notification}
            />
          ))
        )}
      </div>
    </ScrollArea>
  );
};

export default NotificationList;