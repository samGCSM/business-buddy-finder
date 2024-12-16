import { useNavigate } from "react-router-dom";
import NotificationCount from "./NotificationCount";
import { useNotificationState } from "./useNotificationState";

const NotificationIndicator = () => {
  const navigate = useNavigate();
  const { notificationCount, hasNewNotifications } = useNotificationState();

  return (
    <NotificationCount
      count={notificationCount}
      hasNew={hasNewNotifications}
      onClick={() => navigate('/notifications')}
    />
  );
};

export default NotificationIndicator;