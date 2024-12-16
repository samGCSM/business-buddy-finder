import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { User } from "@/types/user";

interface UserProspectFilterProps {
  users: User[];
  onUserSelect: ((userId: number) => void) | undefined;
  currentUser: User | null;
}

const UserProspectFilter = ({ users, onUserSelect, currentUser }: UserProspectFilterProps) => {
  return (
    <div className="w-full max-w-xs">
      <Select
        onValueChange={(value) => onUserSelect?.(parseInt(value))}
        defaultValue={currentUser?.id.toString()}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a user" />
        </SelectTrigger>
        <SelectContent>
          {currentUser && (
            <SelectItem value={currentUser.id.toString()}>
              {currentUser.email} (Me)
            </SelectItem>
          )}
          {users.map((user) => (
            user.id !== currentUser?.id && (
              <SelectItem key={user.id} value={user.id.toString()}>
                {user.email}
              </SelectItem>
            )
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default UserProspectFilter;