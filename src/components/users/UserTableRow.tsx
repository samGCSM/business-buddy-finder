import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { User } from "@/types/user";
import { useState } from "react";

interface UserTableRowProps {
  user: User;
  formatDate: (date: string | null) => string;
  getNumericValue: (value: number | null | undefined) => number;
  onDelete: (id: number) => void;
  onChangePassword: (id: string) => void;
  onUpdateUser: (id: number, updates: Partial<User>) => Promise<void>;
}

export const UserTableRow = ({ 
  user, 
  formatDate, 
  getNumericValue, 
  onDelete, 
  onChangePassword,
  onUpdateUser
}: UserTableRowProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleRoleChange = async (newRole: string) => {
    try {
      await onUpdateUser(user.id, { type: newRole });
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  return (
    <tr key={user.id}>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {user.email}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {isEditing ? (
          <Select defaultValue={user.type} onValueChange={handleRoleChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="supervisor">Supervisor</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          user.type
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {formatDate(user.lastLogin)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {getNumericValue(user.totalSearches)} (30d)
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {getNumericValue(user.savedSearches)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {user.stats?.total_prospects || 0}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
        {user.type !== "admin" && (
          <>
            <Button
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Done' : 'Edit'}
            </Button>
            <Button
              variant="outline"
              onClick={() => onChangePassword(user.id.toString())}
            >
              Change Password
            </Button>
            <Button
              variant="destructive"
              onClick={() => onDelete(user.id)}
            >
              Delete
            </Button>
          </>
        )}
      </td>
    </tr>
  );
};