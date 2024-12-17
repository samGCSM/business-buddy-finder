interface NotificationMessageProps {
  notification: any;
}

const NotificationMessage = ({ notification }: NotificationMessageProps) => {
  const formatMessage = () => {
    const noteMatch = notification.message.match(/New note from (.*?) on prospect (.*)/);
    if (noteMatch) {
      const userType = noteMatch[1];
      return (
        <div>
          <p className="font-medium">
            New note from {userType} on {notification.businessName || 'Unknown Business'}
          </p>
          <p className="text-sm text-gray-600 mt-1">{notification.content}</p>
        </div>
      );
    }
    return notification.message;
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {formatMessage()}
      <span className="text-xs text-gray-400 block mt-2">
        {new Date(notification.timestamp).toLocaleString()}
      </span>
    </div>
  );
};

export default NotificationMessage;