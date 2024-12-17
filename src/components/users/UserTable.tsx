import type { User } from "@/types/user";
import { UserTableHeader } from "./UserTableHeader";
import { UserTableRow } from "./UserTableRow";
import { formatDate, getNumericValue } from "./UserTableUtils";
import { useUserData } from "@/hooks/useUserData";
import { useUserActions } from "./UserActions";

interface UserTableProps {
  users: User[];
  setUsers: (users: User[]) => void;
  setSelectedUserId: (id: string | null) => void;
}

export const UserTable = ({ users, setUsers, setSelectedUserId }: UserTableProps) => {
  const { isLoading } = useUserData(setUsers);
  const { handleDeleteUser, handleUpdateUser } = useUserActions(users, setUsers);

  if (isLoading) {
    return <div className="flex justify-center items-center">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <UserTableHeader />
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <UserTableRow
                key={user.id}
                user={user}
                users={users}
                formatDate={formatDate}
                getNumericValue={getNumericValue}
                onDelete={handleDeleteUser}
                onChangePassword={() => setSelectedUserId(user.id.toString())}
                onUpdateUser={handleUpdateUser}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};