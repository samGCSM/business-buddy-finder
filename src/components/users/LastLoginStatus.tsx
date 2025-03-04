
import { Clock, AlertCircle, UserCheck } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDistanceToNow, isAfter, subDays } from "date-fns";

type LastLoginStatusProps = {
  lastLogin: string | null;
};

export const LastLoginStatus = ({ lastLogin }: LastLoginStatusProps) => {
  if (!lastLogin) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="flex items-center gap-1">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-red-500">Never</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>User has never logged in</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const loginDate = new Date(lastLogin);
  const now = new Date();
  const sevenDaysAgo = subDays(now, 7);
  const oneDayAgo = subDays(now, 1);

  // User logged in within the last day
  if (isAfter(loginDate, oneDayAgo)) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="flex items-center gap-1">
            <UserCheck className="h-4 w-4 text-green-500" />
            <span>{formatDistanceToNow(loginDate, { addSuffix: true })}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Recent login: {loginDate.toLocaleString()}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // User logged in within the last week
  if (isAfter(loginDate, sevenDaysAgo)) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-yellow-500" />
            <span>{formatDistanceToNow(loginDate, { addSuffix: true })}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Last login: {loginDate.toLocaleString()}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  // User hasn't logged in for more than a week
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="flex items-center gap-1">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-red-500">{formatDistanceToNow(loginDate, { addSuffix: true })}</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>Inactive user: Last login {loginDate.toLocaleString()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
