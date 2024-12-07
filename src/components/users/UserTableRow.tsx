import { Button } from "@/components/ui/button";
import type { User } from "@/types/user";

interface UserTableRowProps {
  user: User;
  formatDate: (date: string | null) => string;
  getNumericValue: (value: number | null | undefined) => number;
  onDelete: (id: number) => void;
  onChangePassword: (id: string) => void;
}

export const UserTableRow = ({ 
  user, 
  formatDate, 
  getNumericValue, 
  onDelete, 
  onChangePassword 
}: UserTableRowProps) => (
  <tr key={user.id}>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
      {user.email}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
      {user.type}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
      {formatDate(user.lastLogin)}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
      {getNumericValue(user.totalSearches)}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
      {getNumericValue(user.savedSearches)}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
      {user.type !== "admin" && (
        <>
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