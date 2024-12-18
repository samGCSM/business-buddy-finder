import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { User } from "@/types/user";
import { useState } from "react";

interface UserTableRowProps {
  user: User;
  users: User[];
  formatDate: (date: string | null) => string;
  getNumericValue: (value: number | null | undefined) => number;
  onDelete: (id: number) => void;
  onChangePassword: (id: string) => void;
  onUpdateUser: (id: number, updates: Partial<User>) => Promise<void>;
}

export const UserTableRow = ({ 
  user, 
  users,
  formatDate, 
  getNumericValue, 
  onDelete, 
  onChangePassword,
  onUpdateUser
}: UserTableRowProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user.full_name || '');

  const handleRoleChange = async (newRole: string) => {
    try {
      await onUpdateUser(user.id, { type: newRole });
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleSupervisorChange = async (supervisorId: string) => {
    try {
      const newSupervisorId = supervisorId === "none" ? null : parseInt(supervisorId);
      await onUpdateUser(user.id, { supervisor_id: newSupervisorId });
    } catch (error) {
      console.error('Error updating supervisor:', error);
    }
  };

  const handleFullNameSave = async () => {
    try {
      await onUpdateUser(user.id, { full_name: fullName });
    } catch (error) {
      console.error('Error updating full name:', error);
    }
  };

  const getSupervisorEmail = () => {
    if (!user.supervisor_id) return 'None';
    const supervisor = users.find(u => u.id === user.supervisor_id);
    return supervisor ? supervisor.email : 'Unknown';
  };

  const supervisors = users.filter(u => u.type === 'supervisor' || u.type === 'admin');

  return (
    <tr key={user.id}>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {user.email}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {isEditing ? (
          <div className="flex gap-2">
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onBlur={handleFullNameSave}
              placeholder="Enter full name"
              className="w-[180px]"
            />
          </div>
        ) : (
          user.full_name || '-'
        )}
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
        {isEditing ? (
          <Select 
            defaultValue={user.supervisor_id?.toString() || "none"} 
            onValueChange={handleSupervisorChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select supervisor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {supervisors.map((supervisor) => (
                <SelectItem key={supervisor.id} value={supervisor.id.toString()}>
                  {supervisor.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          getSupervisorEmail()
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